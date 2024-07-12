import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import FeedSharpIcon from "@mui/icons-material/FeedSharp";
import AddCircleSharpIcon from "@mui/icons-material/AddCircleSharp";
import { grey } from "@mui/material/colors";
import { useCommonContext } from "../context/CommonContext";
import { useMemoContext } from "../context/MemoContext";
import { Memo } from "../types";

const memoListItems = (
  memoData: Memo[],
  selectedMemoId: number,
  handleListItemClick: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number,
  ) => void,
) =>
  memoData.map((data, index) => (
    <ListItemButton
      key={index}
      selected={selectedMemoId === data.id}
      onClick={(e) => handleListItemClick(e, data.id)}
      sx={{
        borderRadius: "3px",
        margin: "4px 0",
        padding: 1,
        "&&.Mui-selected": {
          pointerEvents: "none",
          backgroundColor: "rgba(0, 0, 0, 0.05)",
        },
        "& .MuiTypography-root": {
          color: grey[500],
          fontSize: "0.8rem",
        },
        "&&.Mui-selected .MuiTypography-root": {
          color: grey[800],
          fontWeight: 500,
        },
        "&&.Mui-selected .MuiSvgIcon-root": {
          color: grey[700],
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: "1.5rem" }}>
        <FeedSharpIcon sx={{ color: grey[400], fontSize: "1rem" }} />
      </ListItemIcon>
      <ListItemText secondary={data.name} />
    </ListItemButton>
  ));

const MemoMenu = () => {
  const menuDrawerWidth = 220;
  const { isMobile } = useCommonContext();

  const {
    memoData,
    selectedMemoId,
    setSelectedMemoId,
    isMenuOpen,
    setIsMenuOpen,
    isMemoLoading,
    handleFormOpen,
  } = useMemoContext();

  // プロジェクト一覧を閉じる
  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  // プロジェクトを選択したときの処理
  const handleListItemClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number,
  ) => {
    setSelectedMemoId(index);
  };

  return (
    <Drawer
      sx={{
        width: isMobile ? "auto" : menuDrawerWidth,
        "& .MuiDrawer-paper": {
          padding: 2,
          width: isMobile ? "auto" : menuDrawerWidth,
          boxSizing: "border-box",
          ...(isMobile && {
            height: "80vh",
            borderTopRightRadius: 8,
            borderTopLeftRadius: 8,
          }),
          ...(!isMobile && {
            borderRadius: 0,
            top: 0,
            left: { xs: 0, lg: "92px" },
            marginTop: { xs: "54px", lg: 0 },
            height: "100vh",
            border: "none",
          }),
        },
      }}
      variant={isMobile ? "temporary" : "permanent"}
      anchor={isMobile ? "bottom" : "left"}
      open={isMenuOpen}
      onClose={handleMenuClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      <List
        component="nav"
        aria-label="メモ一覧"
        sx={{
          padding: 0,
          margin: "0 0 18px",
        }}
      >
        {isMemoLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={2}>
            <CircularProgress color="secondary" size={20} />
          </Box>
        ) : (
          memoListItems(memoData, selectedMemoId, handleListItemClick)
        )}
      </List>
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        startIcon={<AddCircleSharpIcon />}
        onClick={() => {
          handleFormOpen();
        }}
        sx={{
          borderColor: (theme) => theme.palette.primary.main,
        }}
      >
        メモを追加
      </Button>
    </Drawer>
  );
};
export default MemoMenu;
