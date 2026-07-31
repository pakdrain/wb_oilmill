// // Shared weight service state
export let currentWeight = "0.00";
export let currentUnit = "kg";
export let isPortConnected = false;
export let currentComPort: string = "COM1";
export let currentBaudRate: number = 9600;

// ✅ Initialize state with env (fallback to COM1/9600)
export function initializeWeightState() {
  currentComPort = process.env.DEFAULT_COM_PORT || "COM1";
  currentBaudRate = parseInt(process.env.DEFAULT_BAUD_RATE || "9600", 10);
}

// ✅ Functions to update the state
export function updateWeight(weight: string) {
  currentWeight = weight;
}

export function updateUnit(unit: string) {
  currentUnit = unit;
}

export function updateConnectionStatus(connected: boolean) {
  isPortConnected = connected;
}

export function updateComPort(port: string) {
  currentComPort = port || "COM1";
  console.log("🔄 COM port updated:", currentComPort);
}

export function updateBaudRate(rate: number) {
  currentBaudRate = rate || 9600;
  console.log("🔄 Baud rate updated:", currentBaudRate);
}






// // Shared weight service state
// export let currentWeight = "0.00";
// export let currentUnit = "kg";
// export let isPortConnected = false;
// export let currentComPort: string = "COM1";
// export let currentBaudRate: number = 9600;

// // Buffer for incomplete serial data
// let dataBuffer: string = "";

// // ✅ Initialize state with env (fallback to COM1/9600)
// export function initializeWeightState() {
//   currentComPort = process.env.DEFAULT_COM_PORT || "COM1";
//   currentBaudRate = parseInt(process.env.DEFAULT_BAUD_RATE || "9600", 10);
// }

// // ✅ Parse Compal format: "0004180=0004180=0004180="
// function parseCompalFormat(rawData: string): number | null {
//   console.log("🔍 Parsing raw data:", rawData);
  
//   // Method 1: Look for pattern like 0004180 (7 digits)
//   const sevenDigitMatch = rawData.match(/(\d{7})/);
//   if (sevenDigitMatch) {
//     const weightStr = sevenDigitMatch[1];
//     console.log("📊 Found 7-digit weight:", weightStr);
    
//     // Convert 0004180 to 4.180 kg
//     // Remove leading zeros and convert to kg
//     const weightNumber = parseInt(weightStr, 10);
//     const weightInKg = weightNumber / 1000; // 4180 / 1000 = 4.180
    
//     console.log(`🔄 Conversion: ${weightStr} → ${weightInKg.toFixed(3)} kg`);
//     return weightInKg;
//   }
  
//   // Method 2: Split by = and check each part
//   const parts = rawData.split('=');
//   for (const part of parts) {
//     const cleaned = part.trim();
//     if (cleaned && cleaned.length >= 4 && /^\d+$/.test(cleaned)) {
//       const weightNum = parseInt(cleaned, 10);
//       if (weightNum > 0) {
//         const weightInKg = weightNum / 1000;
//         console.log(`🔄 Alternative conversion: ${cleaned} → ${weightInKg.toFixed(3)} kg`);
//         return weightInKg;
//       }
//     }
//   }
  
//   return null;
// }

// // ✅ Process incoming serial data (FIXED VERSION)
// export function processSerialData(data: Buffer | string) {
//   // Convert to string
//   const rawString = typeof data === 'string' ? data : data.toString('utf-8');
  
//   console.log("📥 RAW SERIAL DATA:", rawString);
//   console.log("📥 HEX VIEW:", Buffer.from(rawString).toString('hex'));
  
//   // Append to buffer
//   dataBuffer += rawString;
  
//   // Check if we have complete data (contains = signs)
//   if (dataBuffer.includes('=')) {
//     // Split by = and process
//     const segments = dataBuffer.split('=');
    
//     for (let i = 0; i < segments.length - 1; i++) {
//       const segment = segments[i].trim();
//       if (segment && segment.length >= 4) {
//         console.log(`📦 Processing segment ${i}: "${segment}"`);
        
//         const weight = parseCompalFormat(segment + '=');
//         if (weight !== null && weight > 0) {
//           const formattedWeight = weight.toFixed(2);
//           updateWeight(formattedWeight);
//           updateUnit("kg");
//           console.log(`✅ SUCCESS: Weight = ${formattedWeight} kg`);
//           console.log("==================================================");
//         } else if (weight === 0) {
//           // Zero weight is valid
//           updateWeight("0.00");
//           console.log(`⚖️ Zero weight detected`);
//           console.log("==================================================");
//         }
//       }
//     }
    
//     // Keep last incomplete segment in buffer
//     const lastSegment = segments[segments.length - 1];
//     dataBuffer = lastSegment.includes('=') ? '' : lastSegment;
//   }
  
//   // If buffer has complete pattern without splitting
//   if (dataBuffer.includes('=') && dataBuffer.match(/\d{7}=/)) {
//     const matches = dataBuffer.match(/\d{7}=/g);
//     if (matches && matches.length > 0) {
//       const lastMatch = matches[matches.length - 1];
//       const weight = parseCompalFormat(lastMatch);
//       if (weight !== null) {
//         const formattedWeight = weight.toFixed(2);
//         updateWeight(formattedWeight);
//         console.log(`✅ MATCHED: Weight = ${formattedWeight} kg`);
//         console.log("==================================================");
//       }
//     }
//     dataBuffer = '';
//   }
// }

// // ✅ Alternative: Direct parser for Compal format
// export function parseCompalWeightDirect(rawData: string): string | null {
//   console.log("🎯 Direct parsing:", rawData);
  
//   // Look for 7-digit number pattern
//   const regex = /(\d{7})/g;
//   let match;
//   let lastWeight = null;
  
//   while ((match = regex.exec(rawData)) !== null) {
//     const weightStr = match[1];
//     const weightNum = parseInt(weightStr, 10);
//     const weightKg = weightNum / 1000; // Convert to kg
//     lastWeight = weightKg.toFixed(2);
//     console.log(`✨ Found weight: ${weightStr} → ${lastWeight} kg`);
//   }
  
//   return lastWeight;
// }

// // ✅ For testing: Simulate real Compal data stream
// export function testCompalStream() {
//   console.log("🧪 TESTING COMPAL DATA STREAM");
//   console.log("==================================================");
  
//   const testPatterns = [
//     "0004180=0004180=0004180=0004180=0004180=",
//     "0005230=0005230=0005230=0005230=",
//     "0006750=0006750=0006750=",
//     "0000000=0000000=0000000=",
//     "0004180=0004180=0004180="
//   ];
  
//   let index = 0;
//   const interval = setInterval(() => {
//     if (index >= testPatterns.length) {
//       clearInterval(interval);
//       console.log("✅ Test complete");
//       return;
//     }
    
//     const testData = testPatterns[index];
//     console.log(`\n📤 Sending test data ${index + 1}:`);
//     processSerialData(Buffer.from(testData));
//     index++;
//   }, 3000);
// }

// // ✅ Mock serial connection for testing (use this first to verify parsing)
// export async function connectMockSerial(): Promise<boolean> {
//   console.log("🔌 Starting MOCK serial connection for testing");
//   updateConnectionStatus(true);
  
//   // Start test stream
//   testCompalStream();
  
//   return true;
// }

// // ✅ Real serial connection
// export async function connectToSerialPort(): Promise<boolean> {
//   try {
//     const SerialPort = require('serialport');
//     const port = new SerialPort(currentComPort, {
//       baudRate: currentBaudRate,
//       dataBits: 8,
//       parity: 'none',
//       stopBits: 1,
//       autoOpen: false
//     });
    
//     return new Promise((resolve) => {
//       port.open((err: Error | null) => {
//         if (err) {
//           console.error("❌ Failed to open port:", err.message);
//           updateConnectionStatus(false);
//           console.log("\n💡 Tip: Try using connectMockSerial() for testing first");
//           resolve(false);
//         } else {
//           console.log(`✅ Connected to ${currentComPort} at ${currentBaudRate} baud`);
//           updateConnectionStatus(true);
          
//           port.on('data', (data: Buffer) => {
//             console.log("\n📟 SERIAL DATA EVENT TRIGGERED");
//             processSerialData(data);
//           });
          
//           port.on('error', (err: Error) => {
//             console.error("❌ Serial port error:", err.message);
//             updateConnectionStatus(false);
//           });
          
//           resolve(true);
//         }
//       });
//     });
//   } catch (error) {
//     console.error("❌ Failed to connect:", error);
//     updateConnectionStatus(false);
//     return false;
//   }
// }

// // ✅ Functions to update the state
// export function updateWeight(weight: string) {
//   currentWeight = weight;
// }

// export function updateUnit(unit: string) {
//   currentUnit = unit;
// }

// export function updateConnectionStatus(connected: boolean) {
//   isPortConnected = connected;
// }

// export function updateComPort(port: string) {
//   currentComPort = port || "COM1";
//   console.log("🔄 COM port updated:", currentComPort);
// }

// export function updateBaudRate(rate: number) {
//   currentBaudRate = rate || 9600;
//   console.log("🔄 Baud rate updated:", currentBaudRate);
// }