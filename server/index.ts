import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { addSalesRoute } from "./routes-simple";
import { setupVite, serveStatic, log } from "./vite";
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

// Ensure environment variables are loaded
import { config } from 'dotenv';
config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Weight Service Integration
import { 
  currentWeight, 
  currentUnit, 
  isPortConnected, 
  currentComPort, 
  currentBaudRate,
  updateWeight,
  updateUnit,
  updateConnectionStatus,
  updateComPort,
  updateBaudRate,
  initializeWeightState
} from './weight-state';

// Initialize weight state with environment variables
initializeWeightState();

let serialPort: SerialPort | null = null;

// Initialize serial port connection for weight indicator
async function connectToWeightScale() {
  try {
    // First, list available ports to help with debugging
    const { SerialPort: SerialPortStatic } = await import('serialport');
    const ports = await SerialPortStatic.list();
    log('📋 Available serial ports:');
    ports.forEach(port => {
      log(`  - ${port.path}: ${port.manufacturer || 'Unknown'}`);
    });

    serialPort = new SerialPort({
      path: currentComPort,
      baudRate: currentBaudRate,
      dataBits: 8,
      parity: 'none',
      stopBits: 1,
    });

    const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    serialPort.on('open', () => {
      log(`✅ Connected to ${currentComPort} weight indicator`);
      updateConnectionStatus(true);
    });

    serialPort.on('error', (err) => {
      log(`❌ Serial port error: ${err.message}`);
      updateConnectionStatus(false);
    });

    serialPort.on('close', () => {
      log('📡 Serial port closed');
      updateConnectionStatus(false);
      updateWeight('0.00');
      updateUnit('kg');
    });

    // Parse incoming weight data
    parser.on('data', (data) => {
      const weightData = parseWeightData(data);
      if (weightData) {
        updateWeight(weightData.weight);
        updateUnit(weightData.unit);
        log(`📊 Weight: ${weightData.weight} ${weightData.unit}`);
      }
    });

  } catch (error: any) {
    log(`❌ Failed to connect to serial port: ${error.message}`);
    updateConnectionStatus(false);
  }
}

// Parse weight data from serial input
function parseWeightData(rawData: string) {
  try {
    const data = rawData.toString().trim();
    log(`📥 Raw data received: ${data}`);

    let weight = '0.00';
    let unit = 'kg';

    // Parse different weight indicator formats
    if (data.includes('ST,GS,')) {
      // Pattern for Comm Operator format: "ST,GS,     5.00 kg"
      const match = data.match(/ST,GS,\s*([0-9]+\.?[0-9]*)\s*(kg|g|lb)/i);
      if (match) {
        weight = parseFloat(match[1]).toFixed(2);
        unit = match[2].toLowerCase();
      }
    } else if (data.match(/[+-]?[0-9]+\.?[0-9]*\s*(kg|g|lb)/i)) {
      // Simple format: "5.00 kg"
      const match = data.match(/([+-]?[0-9]+\.?[0-9]*)\s*(kg|g|lb)/i);
      if (match) {
        weight = parseFloat(match[1]).toFixed(2);
        unit = match[2].toLowerCase();
      }
    } else if (data.match(/[+-]?[0-9]+\.?[0-9]*kg/i)) {
      // Compact format: "+0005.00kg"
      const match = data.match(/([+-]?[0-9]+\.?[0-9]*)kg/i);
      if (match) {
        weight = parseFloat(match[1]).toFixed(2);
        unit = 'kg';
      }
    }

    return { weight, unit };
  } catch (error: any) {
    log(`❌ Error parsing weight data: ${error.message}`);
    return null;
  }
}

// Weight API endpoints
app.post('/api/weight/connect', (req, res) => {
  const { port, baudRate } = req.body;
  log(`🔌 Connecting to ${port || currentComPort} at ${baudRate || 9600} baud...`);
  
  if (!isPortConnected) {
    connectToWeightScale();
  }
  
  res.json({ 
    success: true, 
    message: `Connecting to ${port || currentComPort}`,
    connected: isPortConnected 
  });
});

// Weight API routes moved to routes.ts file

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  
  // Add Sales API route
  addSalesRoute(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
   const port = 5000;
//const host = '192.168.28.216'; // ← Replace with your actual local IP
const host = '192.168.20.149'; // ← Replace with your actual local IP

server.listen(port, host, () => {
  log(`✅ Server running at http://${host}:${port}`);
  log(`📡 Connecting to ${currentComPort} weight indicator...`);
    
    // Auto-connect to weight scale on startup
    setTimeout(() => {
      connectToWeightScale();
    }, 2000); // Wait 2 seconds after server starts
  }).on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      log(`❌ Port ${port} is already in use. Attempting to kill existing process...`);
      process.exit(1);
    } else {
      log(`❌ Server error: ${err.message}`);
      throw err;
    }
  });
})();
