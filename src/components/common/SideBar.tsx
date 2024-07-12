import React, { CSSProperties } from "react";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import EventNoteSharpIcon from "@mui/icons-material/EventNoteSharp";
import PaymentsSharpIcon from "@mui/icons-material/PaymentsSharp";
import SearchSharpIcon from "@mui/icons-material/SearchSharp";
import LogoutSharpIcon from "@mui/icons-material/LogoutSharp";
import AccessibilityNewSharpIcon from "@mui/icons-material/AccessibilityNewSharp";
import FormatListBulletedSharpIcon from "@mui/icons-material/FormatListBulletedSharp";
import FolderSharpIcon from "@mui/icons-material/FolderSharp";
import FeedSharpIcon from "@mui/icons-material/FeedSharp";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCommonContext } from "../../context/CommonContext";
import { ResponseData } from "../../types";

interface SideBarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  setIsClosing: React.Dispatch<React.SetStateAction<boolean>>;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setLoginAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setResponseUserId: React.Dispatch<React.SetStateAction<string>>;
}

interface MenuItem {
  text: string;
  path: string;
  icon: React.ReactNode;
}

const SideBar = ({
  drawerWidth,
  mobileOpen,
  setIsClosing,
  setMobileOpen,
  setLoginAuth,
  setResponseUserId,
}: SideBarProps) => {
  const navigate = useNavigate();
  const { setUserId } = useCommonContext();

  const menuItems: MenuItem[] = [
    {
      text: "Calendar",
      path: "/",
      icon: (
        <EventNoteSharpIcon
          sx={{ color: "#ffffff82", filter: "drop-shadow(-1px -1px 0px #000)" }}
        />
      ),
    },
    {
      text: "Project",
      path: "/project",
      icon: (
        <FolderSharpIcon
          sx={{ color: "#ffffff82", filter: "drop-shadow(-1px -1px 0px #000)" }}
        />
      ),
    },
    {
      text: "Memo",
      path: "/memo",
      icon: (
        <FeedSharpIcon
          sx={{ color: "#ffffff82", filter: "drop-shadow(-1px -1px 0px #000)" }}
        />
      ),
    },
    {
      text: "Todo",
      path: "/todo",
      icon: (
        <FormatListBulletedSharpIcon
          sx={{ color: "#ffffff82", filter: "drop-shadow(-1px -1px 0px #000)" }}
        />
      ),
    },
    {
      text: "Money",
      path: "/money",
      icon: (
        <PaymentsSharpIcon
          sx={{ color: "#ffffff82", filter: "drop-shadow(-1px -1px 0px #000)" }}
        />
      ),
    },
    {
      text: "Health",
      path: "/health",
      icon: (
        <AccessibilityNewSharpIcon
          sx={{ color: "#ffffff82", filter: "drop-shadow(-1px -1px 0px #000)" }}
        />
      ),
    },
    {
      text: "Search",
      path: "/search",
      icon: (
        <SearchSharpIcon
          sx={{
            color: "#ffffff82",
            filter: "drop-shadow(-1px -1px 0px #000)",
          }}
        />
      ),
    },
  ];

  const baseLinkStyle: CSSProperties = {
    textDecoration: "none",
    display: "block",
    marginBottom: "0.5rem",
    width: "100%",
    filter: "grayscale(1)",
  };

  const activeLinkStyle: CSSProperties = {
    pointerEvents: "none",
    color: "#ffffff",
  };

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleLogout = () => {
    // Cookies に保存されたトークンを削除
    const apiUrl = process.env.REACT_APP_LOGOUT_API;
    if (!apiUrl) {
      return;
    }
    axios
      .post<ResponseData>(apiUrl)
      .then((response) => {
        if (response.data.success) {
          // ログアウト成功時の処理
          setResponseUserId("");
          setUserId("");
          setLoginAuth(false);
          // ログインページにリダイレクト
          navigate("/login");
        } else {
          console.error(response.data.error);
        }
      })
      .catch((error) => {
        // エラー処理
        console.error(error);
      });
  };

  const drawer = (
    <List
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        height: "100%",
        width: "100%",
      }}
    >
      {menuItems.map((item, index) => (
        <NavLink
          key={index}
          to={item.path}
          style={({ isActive }) => ({
            ...baseLinkStyle,
            ...(isActive ? activeLinkStyle : {}),
          })}
        >
          <ListItem disablePadding>
            <ListItemButton
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.7rem 0.25rem",
                borderRadius: "4px",
                backgroundColor: "transparent",
                transition: "backgroundColor 0.3s ease-out",
                "&:hover": {
                  backgroundColor: "#7f7f7f38",
                },
              }}
            >
              <ListItemIcon sx={{ flexGrow: 1, justifyContent: "center" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                className="font-serif"
                disableTypography={true}
                primary={item.text}
                sx={{
                  fontWeight: "500",
                  letterSpacing: "0.1em",
                  color: "#ffffff82",
                  filter: "drop-shadow(-1px -1px 0px #000)",
                  textAlign: "center",
                  flexGrow: 1,
                  fontSize: "0.75rem",
                  margin: "3px 0 0 0",
                }}
              />
            </ListItemButton>
          </ListItem>
        </NavLink>
      ))}
      <IconButton
        onClick={handleLogout}
        sx={{
          marginTop: "auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.7rem 0.25rem",
          borderRadius: "4px",
          backgroundColor: "transparent",
          transition: "backgroundColor 0.3s ease-out",
          "&:hover": {
            backgroundColor: "#7f7f7f38",
          },
        }}
      >
        <LogoutSharpIcon
          sx={{
            color: "#ffffff82",
            filter: "drop-shadow(-1px -1px 0px #000)",
          }}
        />
        <Typography
          className="font-serif"
          sx={{
            fontWeight: "500",
            letterSpacing: "0.1em",
            color: "#ffffff82",
            filter: "drop-shadow(-1px -1px 0px #000)",
            textAlign: "center",
            flexGrow: 1,
            fontSize: "0.75rem",
            margin: "3px 0 0 0",
          }}
        >
          Logout
        </Typography>
      </IconButton>
    </List>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { lg: drawerWidth },
        flexShrink: { lg: 0 },
      }}
      aria-label="サイトメニュー"
    >
      {/* モバイル用のDrawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onTransitionEnd={handleDrawerTransitionEnd}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            borderRadius: 0,
            width: "100px",
            padding: "1rem",
            backgroundImage:
              "linear-gradient(180deg,rgba(50, 50, 50, 0.93),rgba(30, 30, 30, 0.93)),url(/img/noise.webp)",
            backgroundSize: "auto, 125px",
          },
        }}
      >
        {drawer}
      </Drawer>
      {/* PC用のDrawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", lg: "block" },
          "& .MuiDrawer-paper": {
            borderRadius: 0,
            boxSizing: "border-box",
            width: drawerWidth,
            padding: "0.75rem",
            backgroundImage:
              "linear-gradient(180deg,rgba(50, 50, 50, 0.95),rgba(30, 30, 30, 0.95)),url(/img/noise.webp)",
            backgroundSize: "auto, 125px",
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default SideBar;
