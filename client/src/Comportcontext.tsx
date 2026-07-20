import React, { createContext, useState, useContext, ReactNode } from "react";

// Type define karte hain jo context provide karega
type ComPortContextType = {
  comPort: string;
  setComPort: (port: string) => void;
};

// Default context (null rakhenge, pehle check karenge)
const ComPortContext = createContext<ComPortContextType | undefined>(undefined);

// Props type for Provider
type ComPortProviderProps = {
  children: ReactNode;
};

// Provider Component
export const ComPortProvider: React.FC<ComPortProviderProps> = ({ children }) => {
  const [comPort, setComPort] = useState<string>("COM4"); // Default port

  return (
    <ComPortContext.Provider value={{ comPort, setComPort }}>
      {children}
    </ComPortContext.Provider>
  );
};

// Custom Hook (easy access)
export const useComPort = (): ComPortContextType => {
  const context = useContext(ComPortContext);
  if (!context) {
    throw new Error("useComPort must be used inside a ComPortProvider");
  }
  return context;
};
