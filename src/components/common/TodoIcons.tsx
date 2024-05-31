import React from "react";
import WorkSharpIcon from "@mui/icons-material/WorkSharp";
import PersonSharpIcon from "@mui/icons-material/PersonSharp";
import UpdateSharpIcon from "@mui/icons-material/UpdateSharp";
import { TodoType } from "../../types";

export const TodoTypeIcons: Record<TodoType, JSX.Element> = {
  仕事: (
    <WorkSharpIcon
      sx={{
        fontSize: "1.15rem",
      }}
    />
  ),
  プライベート: (
    <PersonSharpIcon
      sx={{
        fontSize: "1.15rem",
      }}
    />
  ),
  ルーティン: (
    <UpdateSharpIcon
      sx={{
        fontSize: "1.15rem",
      }}
    />
  ),
};
