import { useEffect, useState } from 'react';

interface VideoStreamFullscreenProps {
  camera: {
    id: number;
    name: string;
    ip: string;
    port: number;
  };
  isConnected: boolean;
  isStreaming: boolean;
}

export default function VideoStreamFullscreen({
  camera,
  isConnected,
  isStreaming
}: VideoStreamFullscreenProps) {
  const [streamLoading, setStreamLoading] = useState(true);

  useEffect(() => {
    if (isStreaming) {
      const timer = setTimeout(() => setStreamLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isStreaming]);

  if (!isConnected || !isStreaming) {
    return <div className="w-full h-full bg-black"></div>;
  }

  return (
    <div className="w-full h-full bg-black">
      <img
        className="w-full h-full object-cover"
      src={`/api/stream/${camera.id}/mjpeg`}
        alt="Camera Feed"
        onLoad={() => setStreamLoading(false)}
        onError={() => setStreamLoading(false)}
      />
    </div>
  );
}