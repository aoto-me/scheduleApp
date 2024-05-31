import { createContext, useContext, useState } from "react";
import { Health } from "../types";

interface HealthContextType {
  healthData: Health[];
  setHealthData: React.Dispatch<React.SetStateAction<Health[]>>;
  selectedHealthData: Health | null;
  setSelectedHealthData: React.Dispatch<React.SetStateAction<Health | null>>;
  isHealthLoading: boolean;
  setIsHealthLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const HealthContext = createContext<HealthContextType | undefined>(
  undefined,
);

export const HealthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [healthData, setHealthData] = useState<Health[]>([]);
  const [selectedHealthData, setSelectedHealthData] = useState<Health | null>(
    null,
  );
  const [isHealthLoading, setIsHealthLoading] = useState(true);

  return (
    <HealthContext.Provider
      value={{
        healthData,
        setHealthData,
        selectedHealthData,
        setSelectedHealthData,
        isHealthLoading,
        setIsHealthLoading,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealthContext = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error("HealthContextをプロバイダーの中で取得してください");
  }
  return context;
};
