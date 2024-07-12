import React, { useState } from "react";
import { Box, IconButton, Stack, TextField, Typography } from "@mui/material";
import { CSSProperties } from "@mui/material/styles/createMixins";
import DeleteSharpIcon from "@mui/icons-material/DeleteSharp";
import EditSharpIcon from "@mui/icons-material/EditSharp";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import "../styles/Markdown.css";
import { sendRequest } from "../utils/apiRequests";
import { useCommonContext } from "../context/CommonContext";
import { useMemoContext } from "../context/MemoContext";

const fontSerif: CSSProperties = {
  fontFamily:
    "'Zen Old Mincho', 'Times New Roman', 'ヒラギノ明朝 ProN','Hiragino Mincho ProN', 'Yu Mincho', 'YuMincho', 'Yu Mincho', '游明朝体','ＭＳ 明朝', 'MS Mincho', serif !important",
};

const useMemoUpdate = () => {
  const { userId, csrfToken } = useCommonContext();
  const { memoData, setMemoData, selectedMemoData } = useMemoContext();

  const updateMemo = async (type: string, value: string | number) => {
    const apiUrl = process.env.REACT_APP_MEMO_API;
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append("id", selectedMemoData?.id.toString() || "");
    urlSearchParams.append("type", type);
    urlSearchParams.append(type, value.toString());
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    urlSearchParams.append("action", "update");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      // 取得済みMemoのデータを更新
      const newMemoData = memoData.map((prevMemoData) =>
        prevMemoData.id === selectedMemoData?.id
          ? { ...prevMemoData, [type]: value }
          : prevMemoData,
      );
      setMemoData(newMemoData);
    }
  };
  return updateMemo;
};

function MemoContent() {
  const [nameState, setNameState] = useState(false);
  const [memoState, setMemoState] = useState(false);
  const { userId, isMobile, csrfToken } = useCommonContext();
  const { memoData, setMemoData, selectedMemoData, setSelectedMemoData } =
    useMemoContext();

  const updateMemo = useMemoUpdate();

  // プロジェクト名を更新
  const memoNameUpdate = async (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
  ) => {
    if (e.target.value === "" || e.target.value === selectedMemoData?.name) {
      setNameState(false);
      return;
    }
    await updateMemo("name", e.target.value);
    setNameState(false);
  };

  // メモを更新
  const memoMemoUpdate = async (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
  ) => {
    if (e.target.value === selectedMemoData?.memo) {
      setMemoState(false);
      return;
    }
    await updateMemo("memo", e.target.value);
    setMemoState(false);
  };

  // メモを削除
  const handleDelMemo = async () => {
    // ダイアログを表示してユーザーに確認を求める
    const userConfirmed = window.confirm("メモを削除してもよろしいですか？");
    if (userConfirmed) {
      // メモを削除
      const apiUrl = process.env.REACT_APP_DEL_API;
      const urlSearchParams = new URLSearchParams();
      urlSearchParams.append("id", selectedMemoData?.id.toString() || "");
      urlSearchParams.append("userId", userId);
      urlSearchParams.append("csrfToken", csrfToken);
      urlSearchParams.append("tableType", "memo");
      const response = await sendRequest(apiUrl, urlSearchParams);
      if (response) {
        // 取得済みMemoのデータを更新
        const newMemoData = memoData.filter(
          (prevMemoData) => prevMemoData.id !== selectedMemoData?.id,
        );
        setSelectedMemoData(null);
        setMemoData(newMemoData);
      }
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
        p: "2.5rem min(4vw, 1.5rem) 2rem",
        flexGrow: 1,
        width: `${isMobile ? "100%" : "calc(100% - 220px)"}`,
      }}
    >
      <Stack spacing={1}>
        {/* メモ名 */}
        <Box>
          {nameState ? (
            <TextField
              fullWidth
              multiline
              autoComplete="off"
              hiddenLabel
              id="name"
              variant="outlined"
              className="font-serif"
              defaultValue={selectedMemoData?.name}
              onBlur={(e) => memoNameUpdate(e)}
              autoFocus
              sx={{
                backgroundColor: "transparent",
                "& .MuiInputBase-root": {
                  padding: 0,
                  backgroundColor: "transparent",
                },
                "& .MuiInputBase-input": {
                  ...fontSerif,
                  fontWeight: 700,
                  lineHeight: 1.35,
                  fontSize: "clamp(1.85rem, 7vw, 2.5rem)",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none !important",
                },
              }}
            />
          ) : (
            <Typography
              component={"h2"}
              onClick={() => setNameState(true)}
              fontWeight={700}
              className="font-serif"
              sx={{
                lineHeight: 1.35,
                fontSize: "clamp(1.85rem, 7vw, 2.5rem)",
              }}
            >
              {selectedMemoData?.name}
            </Typography>
          )}
        </Box>
        {/* 削除 */}
        <Box
          display="flex"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="space-between"
        >
          <IconButton
            aria-label="delete"
            sx={{ ml: "auto" }}
            onClick={handleDelMemo}
          >
            <DeleteSharpIcon sx={{ opacity: 0.5 }} />
          </IconButton>
        </Box>
      </Stack>
      {/* メモ */}
      <Box className="contentBox" sx={{ mt: 2 }}>
        {memoState && (
          <TextField
            fullWidth
            multiline
            autoComplete="off"
            hiddenLabel
            id="memo"
            variant="outlined"
            defaultValue={selectedMemoData?.memo}
            onBlur={(e) => memoMemoUpdate(e)}
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
        {selectedMemoData?.memo !== "" && memoState === false && (
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
              {selectedMemoData?.memo}
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
        {selectedMemoData?.memo === "" && memoState === false && (
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
            <EditSharpIcon color="secondary" fontSize="small" sx={{ mr: 1 }} />
            <Typography
              component={"span"}
              variant="body1"
              color="textSecondary"
            >
              メモを記載する
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default MemoContent;
