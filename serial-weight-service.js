const express = require("express");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let currentWeight = "0.00";
let currentUnit = "kg";
let isPortConnected = false;
let serialPort = null;
let currentComPort = "COM1"; // ✅ dynamic value
let currentBaudRate = 9600;

// Initialize serial port connection
async function connectToSerial(port = "COM1", baudRate = 9600) {
  try {
    if (serialPort && serialPort.isOpen) {
      serialPort.close();
      console.log("🔌 Previous serial port closed.");
    }

    currentComPort = port;
    currentBaudRate = baudRate;

    serialPort = new SerialPort({
      path: currentComPort,
      baudRate: currentBaudRate,
      dataBits: 8,
      parity: "none",
      stopBits: 1,
    });

    const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\r\n" }));

    serialPort.on("open", () => {
      console.log(`✅ Connected to ${currentComPort} @ ${currentBaudRate}`);
      isPortConnected = true;
    });

    serialPort.on("error", (err) => {
      console.error("❌ Serial port error:", err.message);
      isPortConnected = false;
    });

    serialPort.on("close", () => {
      console.log("📡 Serial port closed");
      isPortConnected = false;
    });

    // Parse incoming weight data
    parser.on("data", (data) => {
      const weightData = parseWeightData(data);
      if (weightData) {
        currentWeight = weightData.weight;
        currentUnit = weightData.unit;
        console.log(`📊 Weight: ${currentWeight} ${currentUnit}`);
      }
    });
  } catch (error) {
    console.error("❌ Failed to connect to serial port:", error.message);
    isPortConnected = false;
  }
}

// Parse weight data from serial input
function parseWeightData(rawData) {
  try {
    const data = rawData.toString().trim();
    console.log("📥 Raw data received:", data);

    let weight = "0.00";
    let unit = "kg";

    if (data.includes("ST,GS,")) {
      const match = data.match(/ST,GS,\s*([0-9]+\.?[0-9]*)\s*(kg|g|lb)/i);
      if (match) {
        weight = parseFloat(match[1]).toFixed(2);
        unit = match[2].toLowerCase();
      }
    } else if (data.match(/[+-]?[0-9]+\.?[0-9]*\s*(kg|g|lb)/i)) {
      const match = data.match(/([+-]?[0-9]+\.?[0-9]*)\s*(kg|g|lb)/i);
      if (match) {
        weight = parseFloat(match[1]).toFixed(2);
        unit = match[2].toLowerCase();
      }
    } else if (data.match(/[+-]?[0-9]+\.?[0-9]*kg/i)) {
      const match = data.match(/([+-]?[0-9]+\.?[0-9]*)kg/i);
      if (match) {
        weight = parseFloat(match[1]).toFixed(2);
        unit = "kg";
      }
    }

    return { weight, unit };
  } catch (error) {
    console.error("❌ Error parsing weight data:", error.message);
    return null;
  }
}

// API Endpoints
app.post("/api/weight/connect", (req, res) => {
  const { port = "COM1", baudRate = 9600 } = req.body;
  console.log(`🔌 Connecting to ${port} at ${baudRate} baud...`);

  connectToSerial(port, baudRate);

  res.json({
    success: true,
    message: `Connecting to ${port}`,
    connected: isPortConnected,
    port: currentComPort,
    baudRate: currentBaudRate,
  });
});

app.get("/api/weight/data", (req, res) => {
  res.json({
    weight: currentWeight,
    unit: currentUnit,
    connected: isPortConnected,
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/weight/tare", (req, res) => {
  if (serialPort && isPortConnected) {
    serialPort.write("T\r\n");
    console.log("⚖️ Tare command sent");
    res.json({ success: true, message: "Tare command sent" });
  } else {
    res
      .status(400)
      .json({ success: false, message: "Serial port not connected" });
  }
});

app.get("/api/weight/status", (req, res) => {
  res.json({
    connected: isPortConnected,
    port: currentComPort,
    baudRate: currentBaudRate,
    currentWeight,
    currentUnit,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Weight Serial Service running on http://localhost:${PORT}`);
  console.log(`📡 Attempting to connect to ${currentComPort}...`);

  // Auto-connect on startup
  setTimeout(() => {
    connectToSerial(currentComPort, currentBaudRate);
  }, 1000);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down weight service...");
  if (serialPort && serialPort.isOpen) {
    serialPort.close();
  }
  process.exit(0);
});
