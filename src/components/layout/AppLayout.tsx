import { Box, Container } from "@mui/system";
import { AppBar, CssBaseline, IconButton, Toolbar } from "@mui/material";
import MenuSharpIcon from "@mui/icons-material/MenuSharp";
import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SideBar from "../common/SideBar";
import { fetchData } from "../../utils/apiRequests";
import {
  Health,
  Money,
  MonthlyMemo,
  Project,
  Section,
  TimeTaken,
  Todo,
} from "../../types";
import { useCommonContext } from "../../context/CommonContext";
import { useMoneyContext } from "../../context/MoneyContext";
import { useTodoContext } from "../../context/TodoContext";
import { useHealthContext } from "../../context/HealthContext";
import { useProjectContext } from "../../context/ProjectContext";

interface AppLayoutProps {
  responseUserId: string;
  responseCsrfToken: string;
  setResponseUserId: React.Dispatch<React.SetStateAction<string>>;
  setLoginAuth: React.Dispatch<React.SetStateAction<boolean>>;
}

function AppLayout({
  responseUserId,
  responseCsrfToken,
  setLoginAuth,
  setResponseUserId,
}: AppLayoutProps) {
  const drawerWidth = 92;
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const {
    setTodoData,
    setIsTodoLoading,
    setTimeTakenData,
    setIsTimeTakenLoading,
    setMonthlyMemoData,
    setIsMonthlyMemoLoading,
  } = useTodoContext();
  const {
    setProjectData,
    setIsProjectLoading,
    setSectionData,
    setIsSectionLoading,
  } = useProjectContext();
  const { setMoneyData, setIsMoneyLoading } = useMoneyContext();
  const { setHealthData, setIsHealthLoading } = useHealthContext();
  const {
    userId,
    csrfToken,
    setUserId,
    setIsDialogOpen,
    setIsEntryDrawerOpen,
    setSessionToken,
  } = useCommonContext();

  // ページ遷移時にリセット
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsEntryDrawerOpen(false);
    setIsDialogOpen(false);
    setIsClosing(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (responseUserId === "") return;
    setUserId(responseUserId);
  }, [responseUserId]);

  useEffect(() => {
    if (responseCsrfToken === "") return;
    setSessionToken(responseCsrfToken);
  }, [responseCsrfToken]);

  // Moneyデータの取得
  const getMoneyData = (tableType: string) => {
    fetchData<Money>(
      process.env.REACT_APP_GET_API,
      userId,
      csrfToken,
      tableType,
      setMoneyData,
      setIsMoneyLoading,
    );
  };

  // ToDoデータの取得
  const getTodoData = (tableType: string) => {
    fetchData<Todo>(
      process.env.REACT_APP_GET_API,
      userId,
      csrfToken,
      tableType,
      setTodoData,
      setIsTodoLoading,
    );
  };

  // TimeTakenデータの取得
  const getTimeTakenData = (tableType: string) => {
    fetchData<TimeTaken>(
      process.env.REACT_APP_GET_API,
      userId,
      csrfToken,
      tableType,
      setTimeTakenData,
      setIsTimeTakenLoading,
    );
  };

  // MonthlyMemoデータの取得
  const getMonthlyMemoData = (tableType: string) => {
    fetchData<MonthlyMemo>(
      process.env.REACT_APP_GET_API,
      userId,
      csrfToken,
      tableType,
      setMonthlyMemoData,
      setIsMonthlyMemoLoading,
    );
  };

  // Projectデータの取得
  const getProjectData = (tableType: string) => {
    fetchData<Project>(
      process.env.REACT_APP_GET_API,
      userId,
      csrfToken,
      tableType,
      setProjectData,
      setIsProjectLoading,
    );
  };

  // Sectionデータの取得
  const getSectionData = (tableType: string) => {
    fetchData<Section>(
      process.env.REACT_APP_GET_API,
      userId,
      csrfToken,
      tableType,
      setSectionData,
      setIsSectionLoading,
    );
  };

  // Healthデータの取得
  const getHealthData = (tableType: string) => {
    fetchData<Health>(
      process.env.REACT_APP_GET_API,
      userId,
      csrfToken,
      tableType,
      setHealthData,
      setIsHealthLoading,
    );
  };

  useEffect(() => {
    if (userId === "" || csrfToken === "") return;
    getMoneyData("money");
    getTodoData("todo");
    getTimeTakenData("timeTaken");
    getHealthData("health");
    getProjectData("project");
    getSectionData("section");
    getMonthlyMemoData("monthlyMemo");
  }, [userId, csrfToken]);

  // Drawerの開閉
  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  return (
    <Container
      sx={{
        display: { lg: "flex" },
        width: "100%",
        minHeight: "100vh",
        maxWidth: "none !important",
        padding: "0 !important",
        margin: "0 !important",
      }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "transparent !important",
          width: "70px",
          boxShadow: "none",
          display: { lg: "none" },
          left: 0,
        }}
      >
        <Toolbar
          sx={{
            paddingLeft: "24px",
            paddingRight: "24px",
            minHeight: "64px",
          }}
        >
          <IconButton
            aria-label="メニューの開閉"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { lg: "none" },
              borderRadius: "3px",
              border: "1px solid",
              borderColor: "#555",
              backgroundImage:
                "linear-gradient(180deg, rgba(247, 244, 240, 0.93), rgba(247, 244, 240, 0.93)), url(/img/noise.webp)",
              backgroundSize: "auto, 125px",
              "&&:hover": {
                backgroundImage:
                  "linear-gradient(180deg, rgba(210, 210, 210, 0.93), rgba(210, 210, 210, 0.93)), url(/img/noise.webp)",
              },
            }}
          >
            <MenuSharpIcon color="primary" />
          </IconButton>
        </Toolbar>
      </AppBar>
      <SideBar
        setLoginAuth={setLoginAuth}
        setResponseUserId={setResponseUserId}
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        setIsClosing={setIsClosing}
        setMobileOpen={setMobileOpen}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Outlet />
      </Box>
    </Container>
  );
}

export default AppLayout;
