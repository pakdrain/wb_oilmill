import { spawn, ChildProcess } from 'child_process';
import { Express, Request, Response } from 'express';
import { storage } from './storage';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';

class VideoStreamService {
  private ffmpegProcesses: Map<number, ChildProcess> = new Map();
  private streamPaths: Map<number, string> = new Map();

  constructor() {
    // Create streams directory if it doesn't exist
    const streamsDir = path.join(process.cwd(), 'streams');
    if (!fs.existsSync(streamsDir)) {
      fs.mkdirSync(streamsDir, { recursive: true });
    }
  }


  
  async startStream(cameraId: number): Promise<string | null> {
    try {
      const camera = await storage.getCamera(cameraId);
      if (!camera) {
        console.error(`Camera ${cameraId} not found`);
        return null;
      }

      // Stop existing stream if running
      this.stopStream(cameraId);

      const streamPath = path.join(process.cwd(), 'streams', `camera_${cameraId}`);
      const playlistPath = path.join(streamPath, 'playlist.m3u8');

      // Create stream directory
      if (!fs.existsSync(streamPath)) {
        fs.mkdirSync(streamPath, { recursive: true });
      }

      console.log(`Starting FFmpeg stream for camera ${cameraId}: ${camera.rtspUrl}`);


//const ffmpegPath = 'C:\\Users\\Admin\\Downloads\\ffmpeg-8.1-essentials_build\\bin\\ffmpeg.exe';


      // FFmpeg command to convert RTSP to MJPEG stream for better browser compatibility
  const ffmpeg = spawn('ffmpeg', [
  '-rtsp_transport', 'tcp',
  '-i', camera.rtspUrl,
  '-q:v', '5',  
  '-r', '15',   
  '-f', 'mjpeg',
  '-'  
]);

      ffmpeg.stdout.on('data', (data) => {
        console.log(`FFmpeg stdout: ${data}`);
      });

      ffmpeg.stderr.on('data', (data) => {
        console.log(`FFmpeg stderr: ${data}`);
      });

      ffmpeg.on('close', (code) => {
        console.log(`FFmpeg process exited with code ${code}`);
        this.ffmpegProcesses.delete(cameraId);
        this.streamPaths.delete(cameraId);
      });

      ffmpeg.on('error', (error) => {
        console.error(`FFmpeg error: ${error}`);
        this.ffmpegProcesses.delete(cameraId);
        this.streamPaths.delete(cameraId);
      });

      this.ffmpegProcesses.set(cameraId, ffmpeg);
      this.streamPaths.set(cameraId, streamPath);

      return `/api/stream/${cameraId}/playlist.m3u8`;
    } catch (error) {
      console.error(`Error starting stream for camera ${cameraId}:`, error);
      return null;
    }
  }

  stopStream(cameraId: number): void {
    const ffmpeg = this.ffmpegProcesses.get(cameraId);
    if (ffmpeg) {
      console.log(`Stopping stream for camera ${cameraId}`);
      ffmpeg.kill('SIGTERM');
      this.ffmpegProcesses.delete(cameraId);
    }

    const streamPath = this.streamPaths.get(cameraId);
    if (streamPath) {
      // Clean up stream files
      try {
        if (fs.existsSync(streamPath)) {
          fs.rmSync(streamPath, { recursive: true, force: true });
        }
      } catch (error) {
        console.error(`Error cleaning up stream files: ${error}`);
      }
      this.streamPaths.delete(cameraId);
    }
  }

  getStreamPath(cameraId: number): string | undefined {
    return this.streamPaths.get(cameraId);
  }

  isStreamActive(cameraId: number): boolean {
    const ffmpeg = this.ffmpegProcesses.get(cameraId);
    return ffmpeg !== undefined && !ffmpeg.killed;
  }

  registerRoutes(app: Express): void {
    // MJPEG stream endpoint

    
  // Inside registerRoutes() MJPEG endpoint
app.get('/api/stream/:cameraId/mjpeg', async (req: Request, res: Response) => {
  const cameraId = parseInt(req.params.cameraId);

  try {
    const camera = await storage.getCamera(cameraId);
    if (!camera) {
      return res.status(404).json({ error: 'Camera not found' });
    }

    console.log(`Starting MJPEG stream for camera ${cameraId}`);

    // Set proper headers for MJPEG stream
    res.writeHead(200, {
      'Content-Type': 'multipart/x-mixed-replace; boundary=--myboundary',
      'Cache-Control': 'no-store, no-cache, must-revalidate, pre-check=0, post-check=0, max-age=0',
      'Pragma': 'no-cache',
      'Connection': 'close',
      'Expires': 'Mon, 3 Jan 2000 12:34:56 GMT',
      'Access-Control-Allow-Origin': '*'
    });

    // Start FFmpeg process
    const ffmpeg = spawn('ffmpeg', [
      '-rtsp_transport', 'tcp',
      '-i', camera.rtspUrl,
      '-r', '15',                  // FPS
      '-q:v', '5',                 // JPEG quality
      '-pix_fmt', 'yuvj420p',      // MJPEG compatible pixel format
      '-f', 'mjpeg',
      '-'                          // output to stdout
    ]);

    let frameBuffer = Buffer.alloc(0);

    ffmpeg.stdout.on('data', (chunk: Buffer) => {
      frameBuffer = Buffer.concat([frameBuffer, chunk]);

      let start = frameBuffer.indexOf(Buffer.from([0xff, 0xd8]));
      let end = frameBuffer.indexOf(Buffer.from([0xff, 0xd9]), start + 1);

      while (start !== -1 && end !== -1) {
        const jpegFrame = frameBuffer.slice(start, end + 2);
        res.write('--myboundary\r\n');
        res.write('Content-Type: image/jpeg\r\n');
        res.write(`Content-Length: ${jpegFrame.length}\r\n\r\n`);
        res.write(jpegFrame);
        res.write('\r\n');

        frameBuffer = frameBuffer.slice(end + 2);
        start = frameBuffer.indexOf(Buffer.from([0xff, 0xd8]));
        end = frameBuffer.indexOf(Buffer.from([0xff, 0xd9]), start + 1);
      }
    });

    ffmpeg.stderr.on('data', (data) => {
      console.log(`FFmpeg stderr: ${data}`);
    });

    ffmpeg.on('close', () => {
      console.log('FFmpeg process closed');
      res.end();
    });

    ffmpeg.on('error', (error) => {
      console.error('FFmpeg error:', error);
      res.status(500).end();
    });

    // Clean up when client disconnects
    req.on('close', () => {
      console.log('Client disconnected, stopping FFmpeg');
      ffmpeg.kill('SIGTERM');
    });

  } catch (error) {
    console.error('Error starting MJPEG stream:', error);
    res.status(500).json({ error: 'Failed to start stream' });
  }
});

    // Start stream endpoint
    app.post('/api/stream/:cameraId/start', async (req, res) => {
      const cameraId = parseInt(req.params.cameraId);
      
      try {
        const streamUrl = await this.startStream(cameraId);
        if (streamUrl) {
          res.json({ success: true, streamUrl });
        } else {
          res.status(500).json({ error: 'Failed to start stream' });
        }
      } catch (error) {
        console.error('Error starting stream:', error);
        res.status(500).json({ error: 'Failed to start stream' });
      }
    });

    // Stop stream endpoint
    app.post('/api/stream/:cameraId/stop', (req, res) => {
      const cameraId = parseInt(req.params.cameraId);
      this.stopStream(cameraId);
      res.json({ success: true });
    });

    // Stream status endpoint
    app.get('/api/stream/:cameraId/status', (req, res) => {
      const cameraId = parseInt(req.params.cameraId);
      const isActive = this.isStreamActive(cameraId);
      res.json({ active: isActive });
    });
  }
}

export const videoStreamService = new VideoStreamService();
