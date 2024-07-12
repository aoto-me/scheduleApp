import { createContext, useContext, useState } from "react";
import { Memo } from "../types";

interface MemoContextType {
  memoData: Memo[];
  setMemoData: React.Dispatch<React.SetStateAction<Memo[]>>;
  isMemoLoading: boolean;
  setIsMemoLoading: React.Dispatch<React.SetStateAction<boolean>>;
  selectedMemoData: Memo | null;
  setSelectedMemoData: React.Dispatch<React.SetStateAction<Memo | null>>;
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isFormOpen: boolean;
  setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleFormOpen: () => void;
  handleFormClose: () => void;
  selectedMemoId: number;
  setSelectedMemoId: React.Dispatch<React.SetStateAction<number>>;
}

export const MemoContext = createContext<MemoContextType | undefined>(
  undefined,
);

export const MemoContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [memoData, setMemoData] = useState<Memo[]>([]);
  const [isMemoLoading, setIsMemoLoading] = useState(true);
  const [selectedMemoData, setSelectedMemoData] = useState<Memo | null>(null);
  const [selectedMemoId, setSelectedMemoId] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // フォームを開く
  const handleFormOpen = () => {
    setIsFormOpen(true);
  };

  // フォームを閉じる
  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  return (
    <MemoContext.Provider
      value={{
        memoData,
        setMemoData,
        isMemoLoading,
        setIsMemoLoading,
        selectedMemoData,
        setSelectedMemoData,
        isMenuOpen,
        setIsMenuOpen,
        isFormOpen,
        setIsFormOpen,
        handleFormOpen,
        handleFormClose,
        selectedMemoId,
        setSelectedMemoId,
      }}
    >
      {children}
    </MemoContext.Provider>
  );
};

export const useMemoContext = () => {
  const context = useContext(MemoContext);
  if (!context) {
    throw new Error("MemoContextをプロバイダーの中で取得してください");
  }
  return context;
};
