// imageCaptureService.ts

import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { log } from './vite';

export interface CaptureImageOptions {
  slipNo: string;
  cameraIp: string;
  cameraPort: number;
  username?: string;
  password?: string;
  entryType?: string;
  purRegType?: string; // For PURCHASE (from pur_reg_type column)
  regType?: string;    // For SALE (from reg_type column)
}

export class ImageCaptureService {
  private baseImagePath = './captured_images';
  private firstWeightFolder = 'first_weight';
  private secondWeightFolder = 'second_weight';

  async ensureDirectoriesExist(): Promise<void> {
    const firstWeightPath = path.join(this.baseImagePath, this.firstWeightFolder);
    const secondWeightPath = path.join(this.baseImagePath, this.secondWeightFolder);
    await fs.mkdir(firstWeightPath, { recursive: true });
    await fs.mkdir(secondWeightPath, { recursive: true });
  }

  // ✅ Helper function to determine which reg type to use
  private getRegTypeToUse(entryType: string, purRegType: string, regType: string): string {
    const cleanEntryType = String(entryType).trim().toUpperCase();
    const cleanPurRegType = String(purRegType).trim().toUpperCase();
    const cleanRegType = String(regType).trim().toUpperCase();
    
    // For PURCHASE and PURCHASE_RETURN, use purRegType
    if (cleanEntryType === 'PURCHASE' || cleanEntryType === 'PURCHASE_RETURN') {
      return cleanPurRegType || 'R'; // Default to 'R' if not provided
    }
    // For SALE and SALE_RETURN, use regType
    else if (cleanEntryType === 'SALE' || cleanEntryType === 'SALE_RETURN') {
      return cleanRegType || 'R'; // Default to 'R' if not provided
    }
    // Default case
    return cleanRegType || cleanPurRegType || 'R';
  }

  // ✅ Capture First Weight Image
  async captureFirstWeightImage(options: CaptureImageOptions): Promise<string> {
    const {
      slipNo,
      cameraIp,
      cameraPort,
      username = 'admin',
      password = 'admin123',
      entryType = 'PURCHASE',
      purRegType = 'R',
      regType = 'R'
    } = options;

    await this.ensureDirectoriesExist();

    const cleanSlipNo = String(slipNo).trim();
    const cleanEntryType = String(entryType).trim().toUpperCase();
    
    // ✅ Determine which reg type to use
    const cleanRegType = this.getRegTypeToUse(cleanEntryType, purRegType, regType);

    const firstWeightPath = path.join(this.baseImagePath, this.firstWeightFolder);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const fiscalYear = currentMonth >= 7 ? now.getFullYear() + 1 : now.getFullYear();

    // ✅ Filename: slip_1001_SALE_R_2027.jpg or slip_1001_PURCHASE_R_2027.jpg
    const filename = `slip_${cleanSlipNo}_${cleanEntryType}_${cleanRegType}_${fiscalYear}.jpg`;
    const imagePath = path.join(firstWeightPath, filename);

    const rtspUrl = `rtsp://${username}:${password}@${cameraIp}:${cameraPort}/cam/realmonitor?channel=1&subtype=0`;

    log(`📸 Capturing first weight image for slip ${cleanSlipNo} (${cleanEntryType} - ${cleanRegType})...`);

    const success = await this.captureImageWithFFmpeg(rtspUrl, imagePath);

    if (!success) {
      throw new Error('Failed to capture image');
    }

    log(`✅ First weight image captured: ${filename}`);
    return imagePath;
  }

  // ✅ Capture Second Weight Image
  async captureSecondWeightImage(options: CaptureImageOptions): Promise<string> {
    const {
      slipNo,
      cameraIp,
      cameraPort,
      username = 'admin',
      password = 'admin123',
      entryType = 'PURCHASE',
      purRegType = 'R',
      regType = 'R'
    } = options;

    await this.ensureDirectoriesExist();

    const cleanSlipNo = String(slipNo).trim();
    const cleanEntryType = String(entryType).trim().toUpperCase();
    
    // ✅ Determine which reg type to use
    const cleanRegType = this.getRegTypeToUse(cleanEntryType, purRegType, regType);

    const secondWeightPath = path.join(this.baseImagePath, this.secondWeightFolder);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const fiscalYear = currentMonth >= 7 ? now.getFullYear() + 1 : now.getFullYear();

    // ✅ Filename: slip_1001_SALE_R_2027.jpg or slip_1001_PURCHASE_R_2027.jpg
    const filename = `slip_${cleanSlipNo}_${cleanEntryType}_${cleanRegType}_${fiscalYear}.jpg`;
    const imagePath = path.join(secondWeightPath, filename);

    const rtspUrl = `rtsp://${username}:${password}@${cameraIp}:${cameraPort}/cam/realmonitor?channel=1&subtype=0`;
    log(`📸 Capturing second weight image for slip ${cleanSlipNo} (${cleanEntryType} - ${cleanRegType})...`);

    const success = await this.captureImageWithFFmpeg(rtspUrl, imagePath);
    if (!success) throw new Error('Failed to capture second weight image');

    log(`✅ Second weight image captured: ${filename}`);
    return imagePath;
  }

  private captureImageWithFFmpeg(rtspUrl: string, outputPath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        '-rtsp_transport', 'tcp',
        '-i', rtspUrl,
        '-frames:v', '1',
        '-q:v', '2',
        '-y',
        outputPath
      ];

      const ffmpeg = spawn('ffmpeg', ffmpegArgs, { stdio: ['ignore', 'pipe', 'pipe'] });

      let errorOutput = '';
      ffmpeg.stderr.on('data', data => { errorOutput += data.toString(); });

      ffmpeg.on('close', code => {
        if (code === 0) resolve(true);
        else reject(new Error(`FFmpeg exited with code ${code}: ${errorOutput}`));
      });

      ffmpeg.on('error', reject);
      setTimeout(() => {
        ffmpeg.kill('SIGKILL');
        reject(new Error('Image capture timeout'));
      }, 10000);
    });
  }

  // ✅ Get First Weight Images - filters by regType (for both PURCHASE and SALE)
  async getFirstWeightImages(
    entryType?: string, 
    slipNo?: string, 
    fiscalYear?: number,
    regType?: string  // This will be either 'R' or 'U'
  ): Promise<string[]> {
    const folderPath = path.join(this.baseImagePath, this.firstWeightFolder);

    try {
      const files = await fs.readdir(folderPath);

      console.log(`🔍 Searching for first weight images:`, {
        entryType,
        slipNo,
        fiscalYear,
        regType,
        totalFiles: files.length
      });

      const filtered = files
        .filter(file => /\.(jpg|jpeg)$/i.test(file))
        .filter(file => {
          if (!entryType) return true;
          // ✅ Check for entryType in filename (case insensitive)
          return file.toUpperCase().includes(`_${entryType.toUpperCase()}_`);
        })
        .filter(file => {
          if (!slipNo) return true;
          return file.includes(`slip_${slipNo}_`);
        })
        .filter(file => {
          if (!fiscalYear) return true;
          // ✅ Extract fiscal year from filename
          const parts = file.split('_');
          const yearPart = parts[parts.length - 1].replace('.jpg', '').replace('.jpeg', '');
          return yearPart === String(fiscalYear);
        })
        .filter(file => {
          if (!regType) return true;
          // ✅ Filter by regType (R or U) - check the 4th part of filename
          const parts = file.split('_');
          if (parts.length >= 4) {
            const fileRegType = parts[3]; // slip_123_SALE_R_2027.jpg -> parts[3] = 'R'
            return fileRegType.toUpperCase() === regType.toUpperCase();
          }
          return false;
        })
        .sort()
        .reverse();

      console.log(`📸 Found ${filtered.length} matching first weight images`);
      return filtered;

    } catch (error) {
      console.error('Error reading first weight images:', error);
      return [];
    }
  }

  // ✅ Get Second Weight Images - filters by regType (for both PURCHASE and SALE)
  async getSecondWeightImages(
    entryType?: string, 
    slipNo?: string, 
    fiscalYear?: number,
    regType?: string  // This will be either 'R' or 'U'
  ): Promise<string[]> {
    const folderPath = path.join(this.baseImagePath, this.secondWeightFolder);

    try {
      const files = await fs.readdir(folderPath);

      console.log(`🔍 Searching for second weight images:`, {
        entryType,
        slipNo,
        fiscalYear,
        regType,
        totalFiles: files.length
      });

      const filtered = files
        .filter(file => /\.(jpg|jpeg)$/i.test(file))
        .filter(file => {
          if (!entryType) return true;
          // ✅ Check for entryType in filename (case insensitive)
          return file.toUpperCase().includes(`_${entryType.toUpperCase()}_`);
        })
        .filter(file => {
          if (!slipNo) return true;
          return file.includes(`slip_${slipNo}_`);
        })
        .filter(file => {
          if (!fiscalYear) return true;
          // ✅ Extract fiscal year from filename
          const parts = file.split('_');
          const yearPart = parts[parts.length - 1].replace('.jpg', '').replace('.jpeg', '');
          return yearPart === String(fiscalYear);
        })
        .filter(file => {
          if (!regType) return true;
          // ✅ Filter by regType (R or U) - check the 4th part of filename
          const parts = file.split('_');
          if (parts.length >= 4) {
            const fileRegType = parts[3]; // slip_123_SALE_R_2027.jpg -> parts[3] = 'R'
            return fileRegType.toUpperCase() === regType.toUpperCase();
          }
          return false;
        })
        .sort()
        .reverse();

      console.log(`📸 Found ${filtered.length} matching second weight images`);
      return filtered;

    } catch (error) {
      console.error('Error reading second weight images:', error);
      return [];
    }
  }

  // ✅ Get latest first weight image
  async getLatestFirstWeightImage(
    slipNo: string,
    entryType?: string,
    fiscalYear?: number,
    regType?: string  // This will be either 'R' or 'U'
  ): Promise<string | null> {
    console.log("🔍 getLatestFirstWeightImage:", {
      slipNo,
      entryType,
      fiscalYear,
      regType
    });

    // ✅ FIX: Remove the SALE UNREGISTER blocking logic - this should be handled in API layer
    // The service should just filter by regType

    const images = await this.getFirstWeightImages(
      entryType,
      slipNo,
      fiscalYear,
      regType
    );

    console.log(`📸 Found ${images.length} matching first weight images:`, images);

    return images.length > 0 ? images[0] : null;
  }

  // ✅ Get latest second weight image
  async getLatestSecondWeightImage(
    slipNo: string,
    entryType?: string,
    fiscalYear?: number,
    regType?: string  // This will be either 'R' or 'U'
  ): Promise<string | null> {
    console.log("🔍 getLatestSecondWeightImage:", {
      slipNo,
      entryType,
      fiscalYear,
      regType
    });

    // ✅ FIX: Remove the SALE UNREGISTER blocking logic - this should be handled in API layer

    const images = await this.getSecondWeightImages(
      entryType,
      slipNo,
      fiscalYear,
      regType
    );

    console.log(`📸 Found ${images.length} matching second weight images:`, images);

    return images.length > 0 ? images[0] : null;
  }

  getCurrentFiscalYear(): number {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    return currentMonth >= 7 ? now.getFullYear() + 1 : now.getFullYear();
  }

  async deleteImage(filename: string, firstWeight = true): Promise<boolean> {
    const folder = firstWeight ? this.firstWeightFolder : this.secondWeightFolder;
    const imagePath = path.join(this.baseImagePath, folder, filename);
    try {
      await fs.unlink(imagePath);
      log(`🗑️ Deleted image: ${filename}`);
      return true;
    } catch (error: any) {
      log(`❌ Error deleting image: ${error.message}`);
      return false;
    }
  }
}

export const imageCaptureService = new ImageCaptureService();