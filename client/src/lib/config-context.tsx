import React, { createContext, useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useComPort } from "@/Comportcontext"; // ✅ apna ComPortContext import

interface CameraConfig {
  ip: string;
  port: number;
}

interface ConfigContextType {
  comPort: string | null;
  cameraIp: string;
  cameraPort: number;
  isLoading: boolean;
  refetchConfig: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // ✅ Camera query with proper typing
  const { data: camera } = useQuery<CameraConfig>({
    queryKey: ["/api/cameras/1"],
    refetchInterval: 5000,
    queryFn: async () => {
      const res = await fetch("/api/cameras/1");
      if (!res.ok) throw new Error("Failed to fetch camera config");
      return res.json() as Promise<CameraConfig>;
    },
  });

  // ✅ ComPort context se value lo
  const { comPort } = useComPort();

  const cameraIp = camera?.ip || "10.10.10.146";
  const cameraPort = camera?.port || 554;
  const isLoading = !camera;

  const refetchConfig = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/cameras/1"] });
  };

  // ✅ Sync mechanism for config updates
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "config-updated") {
        console.log("Config update detected, refreshing...");
        refetchConfig();
      }
    };

    const handleConfigUpdate = () => {
      console.log("Config update event received, refreshing...");
      refetchConfig();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("config-updated", handleConfigUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("config-updated", handleConfigUpdate);
    };
  }, [refetchConfig]);

  const value: ConfigContextType = {
    comPort: comPort || "COM1", // ✅ Context + fallback
    cameraIp,
    cameraPort,
    isLoading,
    refetchConfig,
  };

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}
