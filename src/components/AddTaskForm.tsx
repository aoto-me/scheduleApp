import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";
import { format } from "date-fns";
import TodoForm from "./TodoForm";
import { useProjectContext } from "../context/ProjectContext";
import { useTodoContext } from "../context/TodoContext";

const AddTaskForm = () => {
  const toDay = format(new Date(), "yyyy-MM-dd");
  const { selectedTodoData } = useTodoContext();
  const { handleFormClose } = useProjectContext();

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"flex-start"}
        mb={2}
      >
        <Typography
          variant="h6"
          className="font-serif"
          fontWeight={700}
          mt={0.5}
        >
          {selectedTodoData ? "タスクの編集" : "タスクの追加"}
        </Typography>
        <IconButton
          onClick={handleFormClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseSharpIcon />
        </IconButton>
      </Box>
      <TodoForm currentDay={toDay} type="task" />
    </>
  );
};

export default AddTaskForm;
