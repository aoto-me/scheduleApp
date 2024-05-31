import React from "react";
import { Dialog, DialogContent } from "@mui/material";
import { useProjectContext } from "../context/ProjectContext";
import AddProjectForm from "./AddProjectForm";
import AddSectionForm from "./AddSectionForm";
import AddTaskForm from "./AddTaskForm";

const ProjectFormArea = () => {
  const { isFormOpen, handleFormClose, isFormType } = useProjectContext();

  return (
    <Dialog
      maxWidth={"sm"}
      fullWidth
      open={isFormOpen}
      onClose={handleFormClose}
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
        {isFormType === "add" && <AddProjectForm />}
        {isFormType === "section" && <AddSectionForm />}
        {isFormType === "task" && <AddTaskForm />}
      </DialogContent>
    </Dialog>
  );
};
export default ProjectFormArea;
