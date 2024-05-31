import React from "react";
import RestaurantSharpIcon from "@mui/icons-material/RestaurantSharp";
import WorkSharpIcon from "@mui/icons-material/WorkSharp";
import DryCleaningSharpIcon from "@mui/icons-material/DryCleaningSharp";
import HomeSharpIcon from "@mui/icons-material/HomeSharp";
import IcecreamSharpIcon from "@mui/icons-material/IcecreamSharp";
import TrainSharpIcon from "@mui/icons-material/TrainSharp";
import Diversity3SharpIcon from "@mui/icons-material/Diversity3Sharp";
import DiamondSharpIcon from "@mui/icons-material/DiamondSharp";
import CelebrationSharpIcon from "@mui/icons-material/CelebrationSharp";
import DevicesSharpIcon from "@mui/icons-material/DevicesSharp";
import ContentPasteSharpIcon from "@mui/icons-material/ContentPasteSharp";
import LocalHospitalSharpIcon from "@mui/icons-material/LocalHospitalSharp";
import CategorySharpIcon from "@mui/icons-material/CategorySharp";
import SavingsSharpIcon from "@mui/icons-material/SavingsSharp";
import { ExpenseCategory, IncomeCategory } from "../../types";

const MoneyIcons: Record<IncomeCategory | ExpenseCategory, JSX.Element> = {
  食費: (
    <RestaurantSharpIcon
      sx={{
        fontSize: "1.15rem",
      }}
    />
  ),
  日用品: (
    <DryCleaningSharpIcon
      sx={{
        fontSize: "1.15rem",
      }}
    />
  ),
  住宅費: (
    <HomeSharpIcon
      sx={{
        fontSize: "1.15rem",
      }}
    />
  ),
  お菓子: (
    <IcecreamSharpIcon
      sx={{
        fontSize: "1.15rem",
      }}
    />
  ),
  交通費: (
    <TrainSharpIcon
      sx={{
        fontSize: "1.15rem",
      }}
    />
  ),
  交際費: (
    <Diversity3SharpIcon
      sx={{
        fontSize: "1.15rem",
      }}
    />
  ),
  娯楽: (
    <CelebrationSharpIcon
      sx={{
        fontSize: "1.15rem",
      }}
    />
  ),
  美容: (
    <DiamondSharpIcon
      sx={{
        fontSize: "1.15rem",
      }}
    />
  ),
  月契約: (
    <DevicesSharpIcon
      sx={{
        fontSize: "1.15rem",
      }}
    />
  ),
  保険: (
    <ContentPasteSharpIcon
      sx={{
        fontSize: "1.15rem",
      }}
    />
  ),
  医療: (
    <LocalHospitalSharpIcon
      sx={{
        fontSize: "1.15rem",
      }}
    />
  ),
  給与: (
    <WorkSharpIcon
      sx={{
        fontSize: "1.15rem",
      }}
    />
  ),
  副収入: (
    <SavingsSharpIcon
      sx={{
        fontSize: "1.15rem",
      }}
    />
  ),
  その他: (
    <CategorySharpIcon
      sx={{
        fontSize: "1.15rem",
      }}
    />
  ),
};

export default MoneyIcons;
