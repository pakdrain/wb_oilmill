import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useComPort } from "@/Comportcontext"; // ✅ context import

interface CompactWeightIndicatorProps {
  comPort?: string;
  compact?: boolean;
}

export default function WeightIndicator({
  comPort,
  compact = false,
}: CompactWeightIndicatorProps) {
  const [weight, setWeight] = useState<string>("0.00");
  const [isConnected, setIsConnected] = useState(false);
  const [unit, setUnit] = useState("kg");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // ✅ Context se value lo
  const { comPort: globalComPort } = useComPort();

  // ✅ Final COM port (priority: prop > context > fallback)
  const effectiveComPort = comPort || globalComPort || "COM4";

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const connectToSerialPort = async () => {
      try {
        const response = await fetch(`/api/weight/connect`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ port: effectiveComPort, baudRate: 9600 }),
        });

        if (response.ok) {
          setIsConnected(true);
          startWeightPolling();
        } else {
          console.log("Serial service not available, using fallback");
          startFallbackMode();
        }
      } catch (error) {
        console.log("Serial service not available, using fallback");
        startFallbackMode();
      }
    };

    const startWeightPolling = () => {
      interval = setInterval(async () => {
        try {
          const response = await fetch("/api/weight/data");
          if (response.ok) {
            const data = await response.json();
            setWeight(data.weight || "0.00");
            setUnit(data.unit || "kg");
            setLastUpdate(new Date());
            setIsConnected(true);
          }
        } catch (error) {
          console.error("Error fetching weight data:", error);
          setIsConnected(false);
        }
      }, 500); // Poll every 500ms
    };

    const startFallbackMode = () => {
      setIsConnected(false);
      setWeight("0.00");
      setUnit("kg");
    };

    connectToSerialPort();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [effectiveComPort]);

  const handleTare = async () => {
    try {
      const response = await fetch("/api/weight/tare", { method: "POST" });
      if (response.ok) {
        console.log("⚖️ Tare command sent to scale");
      } else {
        console.log("⚖️ Tare function not available - serial service needed");
      }
    } catch (error) {
      console.log("⚖️ Tare function not available - serial service needed");
    }
  };

const formatWeight = (weightValue: string) => {
  const num = parseFloat(weightValue);
  return num.toFixed(2);
};

 // ✅ Compact version (top bar etc.)
if (compact) {
  return (
    <div className="flex items-center rounded px-4 py-1 text-sm font-mono border border-gray-300 shadow-sm" style={{ backgroundColor: 'var(--bg-color, #000000)', color: 'var(--text-color, #ffffff)' }}>
      <span className="font-black text-xl">{formatWeight(weight)}</span>
      <span className="ml-1 text-sm font-bold">{unit.toUpperCase()}</span>
    </div>
  );
}

  // ✅ Full version (main display)
  return (
    <div className="text-center space-y-8">
      <div className="bg-black rounded-lg p-8 border border-monitoring-gray">
        <div className="text-center">
          <div className="text-6xl font-mono font-bold text-monitoring-green mb-3">
            {formatWeight(weight)}
          </div>
          <div className="text-2xl text-gray-400 font-medium">
            {unit.toUpperCase()}
          </div>
        </div>
      </div>

      <Button
        onClick={handleTare}
        disabled={!isConnected}
        className="px-8 py-3 bg-monitoring-blue hover:bg-monitoring-blue/80 text-white text-lg"
      >
        TARE
      </Button>
    </div>
  );
}
