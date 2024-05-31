import { useMediaQuery, useTheme } from "@mui/material";
import { createContext, useContext, useState } from "react";

interface CommonContextType {
  userId: string;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
  currentMonth: Date;
  setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
  isLogin: boolean;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEntryDrawerOpen: boolean;
  setIsEntryDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  csrfToken: string;
  setSessionToken: React.Dispatch<React.SetStateAction<string>>;
}

export const CommonContext = createContext<CommonContextType | undefined>(
  undefined,
);

export const CommonContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const theme = useTheme();
  const [userId, setUserId] = useState("");
  const [csrfToken, setSessionToken] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // 960px以下の場合true
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEntryDrawerOpen, setIsEntryDrawerOpen] = useState(false);
  return (
    <CommonContext.Provider
      value={{
        userId,
        setUserId,
        currentMonth,
        setCurrentMonth,
        isLogin,
        setIsLogin,
        isMobile,
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        isDialogOpen,
        setIsDialogOpen,
        isEntryDrawerOpen,
        setIsEntryDrawerOpen,
        csrfToken,
        setSessionToken,
      }}
    >
      {children}
    </CommonContext.Provider>
  );
};

export const useCommonContext = () => {
  const context = useContext(CommonContext);
  if (!context) {
    throw new Error("CommonContextをプロバイダーの中で取得してください");
  }
  return context;
};
