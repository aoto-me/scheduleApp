import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import "../styles/Markdown.css";
import EditSharpIcon from "@mui/icons-material/EditSharp";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import { format } from "date-fns";
import { useCommonContext } from "../context/CommonContext";
import { useTodoContext } from "../context/TodoContext";
import { MonthlyMemo } from "../types";
import { sendRequest } from "../utils/apiRequests";

interface MonthlyMemoAreaProps {
  pageType: string;
}

export default function MonthlyMemoArea({ pageType }: MonthlyMemoAreaProps) {
  const [memoState, setMemoState] = useState(false);
  const { currentMonth, userId, csrfToken } = useCommonContext();
  const { monthlyMemoData, setMonthlyMemoData, isMonthlyMemoLoading } =
    useTodoContext();
  const [selectedMonthlyMemoData, setSelectedMonthlyMemoData] =
    useState<MonthlyMemo>({
      id: 0,
      date: format(currentMonth, "yyyy-MM-dd"),
      memo: "",
    });

  useEffect(() => {
    const month = format(currentMonth, "yyyy-MM");
    const viewMemoData = monthlyMemoData.find((memo) =>
      memo.date.startsWith(month),
    );
    if (viewMemoData !== undefined) {
      setSelectedMonthlyMemoData(viewMemoData);
    } else {
      setSelectedMonthlyMemoData({
        id: 0,
        date: format(currentMonth, "yyyy-MM-dd"),
        memo: "",
      });
    }
  }, [currentMonth, monthlyMemoData]);

  // メモを更新
  const updateMonthlyMemoData = async (text: string) => {
    if (text === selectedMonthlyMemoData.memo) {
      setMemoState(false);
      return;
    }
    const apiUrl = process.env.REACT_APP_MONTHLYMEMO_API;
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append("id", selectedMonthlyMemoData.id.toString());
    urlSearchParams.append("date", selectedMonthlyMemoData.date.toString());
    urlSearchParams.append("memo", text);
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    urlSearchParams.append("action", "update");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      const newMonthlyMemoData = monthlyMemoData.map((prev) =>
        prev.id === selectedMonthlyMemoData.id ? { ...prev, memo: text } : prev,
      );
      setMonthlyMemoData(newMonthlyMemoData);
      setMemoState(false);
    }
  };

  // メモを保存
  const saveMonthlyMemoData = async (text: string) => {
    if (text === selectedMonthlyMemoData.memo) {
      setMemoState(false);
      return;
    }
    const apiUrl = process.env.REACT_APP_MONTHLYMEMO_API;
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append("date", selectedMonthlyMemoData.date);
    urlSearchParams.append("memo", text);
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    urlSearchParams.append("action", "save");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      const newMonthlyMemoData = {
        id: response.id as number,
        date: selectedMonthlyMemoData.date,
        memo: text,
      };
      setMonthlyMemoData([...monthlyMemoData, newMonthlyMemoData]);
      setMemoState(false);
    }
  };

  // フォームの送信処理
  const onSubmit = async (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
  ) => {
    if (selectedMonthlyMemoData.id !== 0) {
      await updateMonthlyMemoData(e.target.value);
    } else {
      await saveMonthlyMemoData(e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      const start = target.selectionStart ?? 0;
      const end = target.selectionEnd ?? 0;
      const newValue = `${target.value.substring(0, start)}\t${target.value.substring(end)}`;
      target.value = newValue;
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        padding: `${pageType === "home" ? "0 min(4vw,1.5rem) 2rem min(4vw,1.5rem)" : "0"}`,
      }}
    >
      <Box
        className="contentBox"
        sx={{
          width: "100%",
          maxWidth: `${pageType === "home" ? "1000px" : "none"}`,
          margin: "0 auto",
        }}
      >
        {isMonthlyMemoLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress color="secondary" size={30} />
          </Box>
        ) : (
          <>
            {memoState && (
              <TextField
                fullWidth
                multiline
                autoComplete="off"
                hiddenLabel
                id="memo"
                variant="outlined"
                defaultValue={selectedMonthlyMemoData.memo}
                onBlur={(e) => onSubmit(e)}
                autoFocus
                onKeyDown={(e) => {
                  handleKeyDown(e);
                }}
                sx={{
                  p: "min(4vw,1.5rem)",
                  fontSize: { xs: "0.85rem", md: "1rem" },
                  backgroundColor: "transparent",
                  "& .MuiInputBase-root": {
                    padding: 0,
                    backgroundColor: "transparent",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none !important",
                  },
                }}
              />
            )}
            {selectedMonthlyMemoData.memo !== "" && memoState === false && (
              <Box
                p="min(4vw,1.5rem) clamp(2rem, 7vw, 3rem) min(4vw,1.5rem) min(4vw,1.5rem)"
                className="markdown"
                sx={{
                  position: "relative",
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {selectedMonthlyMemoData.memo}
                </ReactMarkdown>
                <IconButton
                  aria-label="メモを編集する"
                  size="small"
                  color="secondary"
                  sx={{
                    position: "absolute",
                    top: "min(4vw,20px)",
                    right: "min(1.5vw, 12px)",
                    borderRadius: "4px",
                  }}
                  onClick={() => setMemoState(true)}
                >
                  <EditSharpIcon
                    sx={{ fontSize: "clamp(0.85rem, 3vw, 1.25rem)" }}
                  />
                </IconButton>
              </Box>
            )}
            {selectedMonthlyMemoData.memo === "" && memoState === false && (
              <Box
                onClick={() => setMemoState(true)}
                p={2}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
                sx={{
                  "&& > *:first-of-type": {
                    marginTop: 0,
                  },
                  "&& > *:last-child": {
                    marginBottom: 0,
                  },
                  "&& > p": {
                    textAlign: "center",
                  },
                }}
              >
                <EditSharpIcon
                  color="secondary"
                  fontSize="small"
                  sx={{ mr: 1 }}
                />
                <Typography
                  component={"span"}
                  variant="body1"
                  color="textSecondary"
                >
                  メモを記載する
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
