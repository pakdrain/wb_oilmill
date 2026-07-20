import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Camera, Video, Clock, FileText } from "lucide-react";
import { Link } from "wouter";
import ConnectionStatus from "@/components/connection-status";
import VideoStreamFullscreen from "@/components/video-stream-fullscreen";
import StreamControls from "@/components/stream-controls";
import StreamInfoPanels from "@/components/stream-info-panels";
import WeightIndicator from "@/components/weight-indicator";
import WeightDisplayTable from "@/components/weight-display-table";
import { useStream } from "@/hooks/use-stream";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/lib/config-context";
// ✅ Import ComPort Context
import { useComPort } from "@/Comportcontext";

export default function CameraMonitor() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [firstWeight, setFirstWeight] = useState<number | null>(null);
  const [secondWeight, setSecondWeight] = useState<number | null>(null);
  const { cameraIp, cameraPort } = useConfig();
  const { comPort } = useComPort();
  
  // Fetch default camera information
  const { data: camera, isLoading: cameraLoading } = useQuery({
    queryKey: ['/api/cameras/1'],
    refetchInterval: false,
  });

  // Fetch weight data
  const { data: weightData } = useQuery({
    queryKey: ['/api/weight/data'],
    refetchInterval: 2000, // Update every 2 seconds
  });

  // Use global config values with fallbacks, updating when config changes
  const cameraData = React.useMemo(() => ({
    id: 1,
    name: camera?.name || "Camera 01",
    ip: camera?.ip || cameraIp || '10.10.10.146',
    port: camera?.port || cameraPort || 554,
    username: camera?.username || 'admin',
    password: camera?.password || 'admin123',
  }), [camera, cameraIp, cameraPort]);

  // Initialize WebSocket stream connection
  const {
    isConnected,
    isStreaming,
    streamStats,
    connectionError,
    startStream,
    stopStream,
    reconnectStream,
  } = useStream(cameraData.id);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-start stream immediately when camera is available
  useEffect(() => {
    if (cameraData.id) {
      // Start stream immediately when camera is loaded
      const timer = setTimeout(() => {
        startStream();
      }, 500); // Small delay to ensure WebSocket is ready

      return () => clearTimeout(timer);
    }
  }, [cameraData.id, startStream]);

  // Restart stream when camera IP or port changes
  useEffect(() => {
    if (isStreaming && (cameraData.ip || cameraData.port)) {
      console.log('Camera configuration changed, restarting stream...');
      stopStream();
      const timer = setTimeout(() => {
        startStream();
      }, 1000); // Give time for the old stream to stop

      return () => clearTimeout(timer);
    }
  }, [cameraData.ip, cameraData.port, isStreaming, stopStream, startStream]);

  if (cameraLoading) {
    return (
      <div className="min-h-screen bg-monitoring-dark flex items-center justify-center">
        <Card className="bg-monitoring-slate border-monitoring-gray p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-monitoring-blue"></div>
            <span className="text-gray-300">Loading camera configuration...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (!camera) {
    return (
      <div className="min-h-screen bg-monitoring-dark flex items-center justify-center">
        <Card className="bg-monitoring-slate border-monitoring-red p-8">
          <div className="flex items-center space-x-3">
            <Video className="h-6 w-6 text-monitoring-red" />
            <span className="text-gray-300">Camera not found. Please check configuration.</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-monitoring-dark overflow-hidden relative">
{/* Top Left Buttons */}
<div className="absolute top-8 left-6 z-50 flex gap-8">
  {/* Column 1: Purchase & Sales */}
  <div className="flex flex-col gap-3">
    <Link href="/purchase-form">
      <Button className="bg-monitoring-blue hover:bg-monitoring-blue/90 text-white font-semibold px-6 py-2 rounded-lg shadow-lg flex items-center">
        <FileText className="h-5 w-5 mr-2" />
        Purchase
      </Button>
    </Link>

    <Link href="/sales-form">
      <Button className="bg-monitoring-blue hover:bg-monitoring-blue/90 text-white font-semibold px-6 py-2 rounded-lg shadow-lg flex items-center">
        <FileText className="h-5 w-5 mr-2" />
        Sale
      </Button>
    </Link>

    {/* <Link href="/sales-return">
      <Button className="bg-monitoring-blue hover:bg-monitoring-blue/90 text-white font-semibold px-6 py-2 rounded-lg shadow-lg flex items-center">
        <FileText className="h-5 w-5 mr-2" />
        Sale Return
      </Button>
    </Link> */}
{/* 
    <Link href="/sold-note">
      <Button className="bg-monitoring-blue hover:bg-monitoring-blue/90 text-white font-semibold px-6 py-2 rounded-lg shadow-lg flex items-center">
        <FileText className="h-5 w-5 mr-2" />
        Sold Note
      </Button>
    </Link> */}
  </div>

  {/* Column 2: Reports */}
  <div className="flex flex-col gap-3">
    <Link href="/reports">
      <Button className="bg-monitoring-blue hover:bg-monitoring-blue/90 text-white font-semibold px-6 py-2 rounded-lg shadow-lg flex items-center">
        <FileText className="h-5 w-5 mr-2" />
        Report
      </Button>
    </Link>

    <Link href="/offline-page">
      <Button className="bg-monitoring-blue hover:bg-monitoring-blue/90 text-white font-semibold px-6 py-2 rounded-lg shadow-lg flex items-center">
        <FileText className="h-5 w-5 mr-2" />
        Offline Reports
      </Button>
    </Link>
  </div>
</div>

      {/* Weight Display Table - Upper Right Corner
      <div className="absolute top-8 right-8 z-50">
        <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 w-64">
     
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="bg-gray-100 border border-gray-400 p-1 text-center text-xs font-semibold text-black">
              Slip No
            </div>
            <div className="bg-gray-100 border border-gray-400 p-1 text-center text-xs font-semibold text-black">
              Vehicle No
            </div>
            <div className="bg-gray-100 border border-gray-400 p-1 text-center text-xs font-semibold text-black">
              Entry Type
            </div>
          </div>

         
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="border border-gray-400 p-1 text-center text-xs bg-white text-black">
              4451
            </div>
            <div className="border border-gray-400 p-1 text-center text-xs bg-white text-black">
              VRS-128
            </div>
            <div className="border border-gray-400 p-1 text-center text-xs bg-white text-blue-600 font-semibold">
              PURCHASE
            </div>
          </div> 
       
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 border border-blue-300 p-2 text-center">
                <div className="text-xs font-semibold text-blue-800 mb-1">First Weight</div>
                <div className="text-lg font-bold text-blue-900">
                  {firstWeight ? `${firstWeight.toFixed(2)} kg` : '---'}
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-300 p-2 text-center">
                <div className="text-xs font-semibold text-gray-600 mb-1">Second Weight</div>
                <div className="text-lg font-bold text-gray-500">
                  {secondWeight ? `${secondWeight.toFixed(2)} kg` : '---'}
                </div>
              </div>
            </div>
            
        
            <div className="bg-green-50 border border-green-300 p-2 text-center">
              <div className="text-xs font-semibold text-green-800 mb-1">Net Weight</div>
              <div className="text-lg font-bold text-green-900">
                {firstWeight && secondWeight ? 
                  `${(firstWeight - secondWeight).toFixed(2)} kg` : 
                  '---'
                }
              </div>
            </div>
          </div>

          <button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 text-xs rounded">
            Load Data
          </button>
        </div>
      </div> */}


      {/* <div className="h-full flex flex-col items-center justify-center p-8"> 
      
       
        <div className="w-40 h-30 mb-8 border border-monitoring-gray rounded overflow-hidden">
          <VideoStreamFullscreen
            camera={cameraData}
            isConnected={isConnected}
            isStreaming={isStreaming}
          />
        </div>
        
  
            <WeightIndicator comPort={comPort} />
        
      </div> */}
    </div> 
  );
}
