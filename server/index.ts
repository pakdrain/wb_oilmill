import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { addSalesRoute } from "./routes-simple";
import { setupVite, serveStatic, log } from "./vite";
import { SerialPort } from 'serialport';

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
let requestInterval: NodeJS.Timeout | null = null;

// Initialize serial port connection for weight indicator
async function connectToWeightScale() {
  try {
    const { SerialPort: SerialPortStatic } = await import('serialport');
    const ports = await SerialPortStatic.list();
    log('📋 Available serial ports:');
    ports.forEach(port => {
      log(`  - ${port.path}: ${port.manufacturer || 'Unknown'}`);
    });

    // ✅ Agar port already open hai toh reconnect mat karo
    if (serialPort && serialPort.isOpen) {
      log('✅ Port already open, skipping reconnect');
      return;
    }

    serialPort = new SerialPort({
      path: currentComPort,
      baudRate: currentBaudRate,
      dataBits: 8,
      parity: 'none',
      stopBits: 1,
    });

    serialPort.on('open', () => {
      log(`✅ Connected to ${currentComPort} weight indicator`);
      updateConnectionStatus(true);

      if (requestInterval) {
        clearInterval(requestInterval);
        requestInterval = null;
      }

      requestInterval = setInterval(() => {
        if (serialPort && serialPort.isOpen) {
          serialPort.write("P\r\n");
        }
      }, 500);
    });

    serialPort.on('error', (err) => {
      log(`❌ Serial port error: ${err.message}`);
      updateConnectionStatus(false);
      if (requestInterval) {
        clearInterval(requestInterval);
        requestInterval = null;
      }
    });

    serialPort.on('close', () => {
      log('📡 Serial port closed');
      updateConnectionStatus(false);
      updateWeight('0.00');
      updateUnit('kg');
      if (requestInterval) {
        clearInterval(requestInterval);
        requestInterval = null;
      }
    });

    serialPort.on('data', (data) => {
      const rawString = data.toString('ascii');
      log(`📥 Raw received: ${rawString}`);

      const match = rawString.match(/=(-?\d+)/);
      if (match) {
        let weightValue = parseInt(match[1], 10);
        if (Math.abs(weightValue).toString().length >= 6) {
          weightValue = weightValue / 1000;
        }
        updateWeight(weightValue.toFixed(3));
        updateUnit('kg');
        log(`✅ WEIGHT UPDATED: ${weightValue.toFixed(3)} kg`);
      } else {
        log(`⚠️ No weight pattern found in: ${rawString}`);
      }
    });

  } catch (error: any) {
    log(`❌ Failed to connect to serial port: ${error.message}`);
    updateConnectionStatus(false);
  }
}

// Weight API endpoints
app.post('/api/weight/connect', (req, res) => {
  const { port, baudRate } = req.body;
  log(`🔌 Connect request for ${port || currentComPort}`);
  
  // ✅ Sirf tab connect karo jab port band ho
  if (!serialPort || !serialPort.isOpen) {
    log('📡 Port not open, connecting...');
    connectToWeightScale();
  } else {
    log('✅ Port already open, skipping reconnect');
  }
  
  res.json({ 
    success: true, 
    message: `Connected to ${port || currentComPort}`,
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

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  const host = '10.10.10.151';

  server.listen(port, host, () => {
    log(`✅ Server running at http://${host}:${port}`);
    log(`📡 Connecting to ${currentComPort} weight indicator...`);
    
    setTimeout(() => {
      connectToWeightScale();
    }, 2000);
  }).on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      log(`❌ Port ${port} is already in use. Attempting to kill existing process...`);
      process.exit(1);
    } else {
      log(`❌ Server error: ${err.message}`);
      throw err;
    }
  });

  // Graceful shutdown
  process.on("SIGINT", () => {
    log('\n🛑 Shutting down...');
    if (requestInterval) clearInterval(requestInterval);
    if (serialPort && serialPort.isOpen) serialPort.close();
    process.exit(0);
  });
})();