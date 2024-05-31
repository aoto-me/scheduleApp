import React from "react";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";
import { FormType } from "../types";
import { useCommonContext } from "../context/CommonContext";
import TodoForm from "./TodoForm";
import MoneyForm from "./MoneyForm";
import HealthForm from "./HealthForm";

interface FormAreaProps {
  isEntryDrawerOpen: boolean;
  closeForm: () => void;
  currentDay: string;
  isFormTypes: FormType;
  setIsFormType: (type: FormType) => void;
}

const FormArea = ({
  isEntryDrawerOpen,
  closeForm,
  currentDay,
  isFormTypes,
}: FormAreaProps) => {
  const formWidth = 320;
  const { isMobile, isDialogOpen } = useCommonContext();

  const formContent = (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        mb={2}
      >
        <Typography className="font-serif" variant="h6" fontWeight={700}>
          {isFormTypes === "todo" && "ToDo"}
          {isFormTypes === "money" && "Money"}
          {isFormTypes === "health" && "Health"}
        </Typography>
        <IconButton
          onClick={closeForm}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseSharpIcon />
        </IconButton>
      </Box>
      {isFormTypes === "todo" && (
        <TodoForm currentDay={currentDay} type="todo" />
      )}
      {isFormTypes === "money" && <MoneyForm currentDay={currentDay} />}
      {isFormTypes === "health" && <HealthForm currentDay={currentDay} />}
    </>
  );

  return (
    <>
      {isMobile ? (
        <Dialog
          maxWidth={"sm"}
          fullWidth
          open={isDialogOpen}
          onClose={closeForm}
          sx={{
            "& .MuiDialog-paper": {
              margin: "2rem auto",
              width: "calc(100% - 2rem)",
            },
          }}
        >
          <DialogContent
            sx={{
              p: "1.25rem min(4vw,1.5rem) 1.75rem min(4vw,1.5rem)",
            }}
          >
            {formContent}
          </DialogContent>
        </Dialog>
      ) : (
        <Box
          sx={{
            overflow: "auto",
            position: "fixed",
            top: 0,
            right: isEntryDrawerOpen ? formWidth : "-2%", // 0だと影が見えるので-2%
            width: formWidth,
            height: "100%",
            bgcolor: "background.paper",
            zIndex: (theme) => theme.zIndex.drawer - 1,
            transition: (theme) =>
              theme.transitions.create("right", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            p: "1rem 1rem 1.5rem 1rem",
            boxSizing: "border-box",
            boxShadow: "0px 0px 15px -5px #777777",
            borderRight: "1px solid #eee",
          }}
        >
          {formContent}
        </Box>
      )}
    </>
  );
};
export default FormArea;
