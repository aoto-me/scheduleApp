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
  Typography,
} from "@mui/material";
import FolderSharpIcon from "@mui/icons-material/FolderSharp";
import AddCircleSharpIcon from "@mui/icons-material/AddCircleSharp";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from "@mui/material/AccordionSummary";
import { grey } from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import { useCommonContext } from "../context/CommonContext";
import { useProjectContext } from "../context/ProjectContext";
import { Project } from "../types";

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(() => ({
  marginBottom: "1rem",
  borderRadius: 0,
  "&::before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={
      <ArrowForwardIosSharpIcon
        sx={{ fontSize: "0.9rem", color: "primary.main" }}
      />
    }
    {...props}
  />
))(({ theme }) => ({
  padding: "0 8px",
  borderBottom: "2px solid #555",
  borderTop: "2px solid #555",
  flexDirection: "row-reverse",
  position: "relative",
  "&&::before": {
    content: "''",
    position: "absolute",
    top: "2px",
    left: 0,
    width: "100%",
    height: "1px",
    backgroundColor: "#555",
  },
  "&&::after": {
    content: "''",
    position: "absolute",
    bottom: "2px",
    left: 0,
    width: "100%",
    height: "1px",
    backgroundColor: "#555",
  },
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(() => ({
  padding: 0,
}));

const projectListItems = (
  projectData: Project[],
  selectedProjectId: number,
  handleListItemClick: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number,
  ) => void,
  completed: number,
) =>
  projectData.map(
    (data, index) =>
      data.completed === completed && (
        <ListItemButton
          key={index}
          selected={selectedProjectId === data.id}
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
            <FolderSharpIcon sx={{ color: grey[400], fontSize: "1rem" }} />
          </ListItemIcon>
          <ListItemText secondary={data.name} />
        </ListItemButton>
      ),
  );

const ProjectMenu = () => {
  const menuDrawerWidth = 220;
  const { isMobile } = useCommonContext();
  const {
    projectData,
    isMenuOpen,
    setIsMenuOpen,
    selectedProjectId,
    setSelectedProjectId,
    handleFormOpen,
    isProjectLoading,
  } = useProjectContext();

  // プロジェクト一覧を閉じる
  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  // プロジェクトを選択したときの処理
  const handleListItemClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number,
  ) => {
    setSelectedProjectId(index);
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
      <Accordion defaultExpanded>
        <AccordionSummary
          aria-controls="未完了のプロジェクト"
          id="unfinished-header"
        >
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{
              fontSize: "0.8rem",
            }}
          >
            未完了のプロジェクト
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List
            component="nav"
            aria-label="未完了のプロジェクトのリスト"
            sx={{
              padding: 0,
              margin: "12px 0 0",
            }}
          >
            {isProjectLoading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                p={2}
              >
                <CircularProgress color="secondary" size={20} />
              </Box>
            ) : (
              projectListItems(
                projectData,
                selectedProjectId,
                handleListItemClick,
                0,
              )
            )}
          </List>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          aria-controls="終了したプロジェクト"
          id="finished-header"
        >
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{ fontSize: "0.8rem" }}
          >
            終了したプロジェクト
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List
            component="nav"
            aria-label="終了したプロジェクトのリスト"
            sx={{
              padding: 0,
              margin: "12px 0 18px",
            }}
          >
            {isProjectLoading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                p={2}
              >
                <CircularProgress color="secondary" size={20} />
              </Box>
            ) : (
              projectListItems(
                projectData,
                selectedProjectId,
                handleListItemClick,
                1,
              )
            )}
          </List>
        </AccordionDetails>
      </Accordion>
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        startIcon={<AddCircleSharpIcon />}
        onClick={() => {
          handleFormOpen("add");
        }}
        sx={{
          borderColor: (theme) => theme.palette.primary.main,
        }}
      >
        プロジェクトを追加
      </Button>
    </Drawer>
  );
};
export default ProjectMenu;
