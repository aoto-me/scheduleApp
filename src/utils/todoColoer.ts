// タイプの種類に基づいて色を返す
import { Theme } from "@mui/material";

export const todoMainColor = (type: string, colorTheme: Theme) => {
  switch (type) {
    case "仕事":
      return colorTheme.palette.workColor.main;
    case "プライベート":
      return colorTheme.palette.privateColor.main;
    case "ルーティン":
      return colorTheme.palette.routineColor.main;
    default:
      return colorTheme.palette.workColor.main;
  }
};

export const todoDarkColor = (type: string, colorTheme: Theme) => {
  switch (type) {
    case "仕事":
      return colorTheme.palette.workColor.dark;
    case "プライベート":
      return colorTheme.palette.privateColor.dark;
    case "ルーティン":
      return colorTheme.palette.routineColor.dark;
    default:
      return colorTheme.palette.workColor.dark;
  }
};
