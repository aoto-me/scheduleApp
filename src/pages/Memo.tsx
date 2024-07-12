import React, { useEffect } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import FeedSharpIcon from "@mui/icons-material/FeedSharp";
import { useCommonContext } from "../context/CommonContext";
import MemoMenu from "../components/MemoMenu";
import MemoContent from "../components/MemoContent";
import { useMemoContext } from "../context/MemoContext";
import MemoFormArea from "../components/MemoFormArea";

export default function Memo() {
  const { isMobile } = useCommonContext();
  const {
    memoData,
    setSelectedMemoData,
    selectedMemoData,
    selectedMemoId,
    setIsMenuOpen,
  } = useMemoContext();

  // 選択中のメモが変更されたときの処理
  useEffect(() => {
    // 選択中のメモを取得
    const newSelectedMemo =
      memoData.find((data) => data.id === selectedMemoId) || null;
    setSelectedMemoData(newSelectedMemo);
    if (isMobile) {
      setIsMenuOpen(false);
    }
  }, [selectedMemoId, memoData]);

  // メモボタンをクリックしたときにプロジェクト一覧のメニューを開く
  const handleMenuOpen = () => {
    setIsMenuOpen(true);
  };

  return (
    <Box
      pt={{ xs: 5, md: 0 }}
      sx={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <IconButton
        aria-label="メモ一覧の開閉"
        onClick={handleMenuOpen}
        sx={{
          position: "fixed",
          top: "11px",
          left: "65px",
          borderRadius: "3px",
          border: "1px solid",
          borderColor: "#555",
          lineHeight: 0,
          zIndex: 10,
          backgroundImage:
            "linear-gradient(180deg, rgba(247, 244, 240, 0.93), rgba(247, 244, 240, 0.93)), url(/img/noise.webp)",
          backgroundSize: "auto, 125px",
          ...(isMobile && {
            display: "block",
          }),
          ...(!isMobile && {
            display: "none",
          }),
          "&&:hover": {
            backgroundImage:
              "linear-gradient(180deg, rgba(210, 210, 210, 0.93), rgba(210, 210, 210, 0.93)), url(/img/noise.webp)",
          },
        }}
      >
        <FeedSharpIcon color="primary" />
      </IconButton>
      <Box sx={{ backgroundColor: "#fff" }}>
        <MemoMenu />
      </Box>
      {selectedMemoData === null ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{
            p: "2rem min(4vw, 1.5rem)",
            flexGrow: 1,
          }}
        >
          <Typography variant="h6" fontWeight={700} className="font-serif">
            メモを選択してください
          </Typography>
        </Box>
      ) : (
        <MemoContent />
      )}
      <MemoFormArea />
    </Box>
  );
}
