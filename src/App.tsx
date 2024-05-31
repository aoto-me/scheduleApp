import React, { useEffect, useState } from "react";
import "./App.css";
import { Route, BrowserRouter, Routes, Navigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";
import axios from "axios";
import { theme } from "./theme/theme";
import { CommonContextProvider } from "./context/CommonContext";
import { MoneyContextProvider } from "./context/MoneyContext";
import { TodoContextProvider } from "./context/TodoContext";
import { HealthContextProvider } from "./context/HealthContext";
import { ProjectContextProvider } from "./context/ProjectContext";
import AppLayout from "./components/layout/AppLayout";
import Health from "./pages/Health";
import Todo from "./pages/Todo";
import Project from "./pages/Project";
import Money from "./pages/Money";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

interface ResponseData {
  success: boolean;
  userId: string;
  csrfToken: string;
  error: string;
}

function App() {
  const [loginAuth, setLoginAuth] = useState(false);
  const [responseUserId, setResponseUserId] = useState("");
  const [responseCsrfToken, setResponseCsrfToken] = useState("");
  const [loading, setLoading] = useState(true);

  const RequireAuth = ({ component }: { component: JSX.Element }) => {
    useEffect(() => {
      if (loginAuth) {
        setLoading(false);
        return;
      }
      const apiUrl = process.env.REACT_APP_AUTH_API;
      if (!apiUrl) {
        setLoading(false);
        return;
      }
      axios
        .get<ResponseData>(apiUrl, {
          withCredentials: true, // クッキーを含めて送信する
        })
        .then((response) => {
          if (response.data.success) {
            // 認証成功
            setResponseUserId(response.data.userId);
            setResponseCsrfToken(response.data.csrfToken);
            setLoginAuth(true);
          }
          setLoading(false);
        })
        .catch((error) => {
          // 通信失敗
          console.error(error);
          setLoading(false);
        });
    }, []);

    if (loading) {
      // 読み込み中の表示
      return (
        <Box
          sx={{
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 9999,
            backgroundColor: "rgb(247, 244, 240)",
          }}
        >
          <CircularProgress color="secondary" size={30} />
        </Box>
      );
    }

    if (loginAuth) {
      return component;
    }
    return <Navigate replace={true} to="/login" />;
  };

  return (
    <CommonContextProvider>
      <TodoContextProvider>
        <ProjectContextProvider>
          <MoneyContextProvider>
            <HealthContextProvider>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <BrowserRouter>
                  <Routes>
                    <Route
                      path="/login"
                      element={
                        <Login
                          loginAuth={loginAuth}
                          setLoginAuth={setLoginAuth}
                        />
                      }
                    />
                    <Route
                      path="/"
                      element={
                        <AppLayout
                          responseUserId={responseUserId}
                          responseCsrfToken={responseCsrfToken}
                          setResponseUserId={setResponseUserId}
                          setLoginAuth={setLoginAuth}
                        />
                      }
                    >
                      <Route
                        index
                        element={<RequireAuth component={<Home />} />}
                      />
                      <Route
                        path="/todo"
                        element={<RequireAuth component={<Todo />} />}
                      />
                      <Route
                        path="/project"
                        element={<RequireAuth component={<Project />} />}
                      />
                      <Route
                        path="/money"
                        element={<RequireAuth component={<Money />} />}
                      />
                      <Route
                        path="/health"
                        element={<RequireAuth component={<Health />} />}
                      />
                      <Route
                        path="/search"
                        element={<RequireAuth component={<Search />} />}
                      />
                      <Route
                        path="*"
                        element={<RequireAuth component={<NotFound />} />}
                      />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </ThemeProvider>
            </HealthContextProvider>
          </MoneyContextProvider>
        </ProjectContextProvider>
      </TodoContextProvider>
    </CommonContextProvider>
  );
}

export default App;
