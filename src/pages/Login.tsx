import React, { useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import LockSharpIcon from "@mui/icons-material/LockSharp";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { theme } from "../theme/theme";
import { useCommonContext } from "../context/CommonContext";

interface ResponseData {
  success: boolean;
  userId: string;
  csrfToken: string;
  error: string;
}

interface LoginProps {
  loginAuth: boolean;
  setLoginAuth: React.Dispatch<React.SetStateAction<boolean>>;
}

function Login({ loginAuth, setLoginAuth }: LoginProps) {
  const navigate = useNavigate();
  const [userNameError, setUserNameError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [loginError, setLoginError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { setUserId, setSessionToken } = useCommonContext();

  useEffect(() => {
    if (loginAuth) {
      navigate("/");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    e.preventDefault();
    setUserNameError("");
    setPasswordError("");
    setLoginError("");
    let isError = false;
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;

    const form = new FormData(e.currentTarget);
    const userName = form.get("userName") as string;
    const password = form.get("password") as string;

    if (userName === "") {
      setUserNameError("ユーザー名を入力してください");
      isError = true;
    } else if (!alphanumericRegex.test(userName)) {
      setUserNameError("ユーザー名は半角英数字で入力してください");
      isError = true;
    }
    if (password === "") {
      setPasswordError("パスワードを入力してください");
      isError = true;
    } else if (!alphanumericRegex.test(password)) {
      setPasswordError("パスワードは半角英数字で構成で入力してください");
      isError = true;
    }
    if (isError) {
      setIsLoading(false);
      return;
    }
    const apiUrl = process.env.REACT_APP_LOGIN_API;
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append("userName", userName);
    urlSearchParams.append("password", password);
    if (!apiUrl) {
      setIsLoading(false);
      setLoginError("データベースへの接続に失敗しました");
      return;
    }
    axios
      .post<ResponseData>(apiUrl, urlSearchParams)
      .then((response) => {
        // 通信成功
        if (response.data.success) {
          setIsLoading(false);
          setUserId(response.data.userId);
          setSessionToken(response.data.csrfToken);
          setLoginAuth(true);
          navigate("/");
        } else {
          setIsLoading(false);
          setLoginError(response.data.error);
        }
      })
      .catch((error) => {
        // 通信失敗
        setIsLoading(false);
        setLoginError("データベースへの接続に失敗しました");
        console.error(error);
      });
  };

  return (
    <Container
      component="main"
      sx={{
        p: 3,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          backgroundColor: "#fff",
          width: "100%",
          maxWidth: "400px",
          borderColor: theme.palette.primary.main,
        }}
      >
        <Box
          padding={1.5}
          className="bgBlack"
          sx={{
            textAlign: "center",
          }}
        >
          <LockSharpIcon sx={{ color: "#fff", verticalAlign: "bottom" }} />
        </Box>
        <Stack
          component="form"
          noValidate
          onSubmit={handleSubmit}
          spacing={3}
          sx={{
            padding: {
              xs: 3,
              sm: 4,
            },
          }}
        >
          <TextField
            label="UserName"
            id="userName"
            name="userName"
            variant="outlined"
            autoComplete="off"
            helperText={userNameError}
            error={userNameError !== ""}
            required
            fullWidth
          />
          <TextField
            label="Password"
            id="password"
            name="password"
            variant="outlined"
            type="password"
            autoComplete="off"
            helperText={passwordError}
            error={passwordError !== ""}
            required
            fullWidth
          />
          {loginError !== "" && (
            <Typography variant="caption" color="error">
              {loginError}
            </Typography>
          )}
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isLoading}
            fullWidth
          >
            {isLoading ? "　" : "ログイン"}
          </LoadingButton>
        </Stack>
      </Paper>
    </Container>
  );
}

export default Login;
