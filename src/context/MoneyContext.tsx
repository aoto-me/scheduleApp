import { createContext, useContext, useState } from "react";
import { Money } from "../types";

interface MoneyContextType {
  moneyData: Money[];
  setMoneyData: React.Dispatch<React.SetStateAction<Money[]>>;
  selectedMoneyData: Money | null;
  setSelectedMoneyData: React.Dispatch<React.SetStateAction<Money | null>>;
  isMoneyLoading: boolean;
  setIsMoneyLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MoneyContext = createContext<MoneyContextType | undefined>(
  undefined,
);

export const MoneyContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [moneyData, setMoneyData] = useState<Money[]>([]);
  const [selectedMoneyData, setSelectedMoneyData] = useState<Money | null>(
    null,
  );
  const [isMoneyLoading, setIsMoneyLoading] = useState(true);

  return (
    <MoneyContext.Provider
      value={{
        moneyData,
        setMoneyData,
        selectedMoneyData,
        setSelectedMoneyData,
        isMoneyLoading,
        setIsMoneyLoading,
      }}
    >
      {children}
    </MoneyContext.Provider>
  );
};

export const useMoneyContext = () => {
  const context = useContext(MoneyContext);
  if (!context) {
    throw new Error("MoneyContextをプロバイダーの中で取得してください");
  }
  return context;
};
