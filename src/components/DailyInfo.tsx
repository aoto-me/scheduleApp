import React from "react";
import { Drawer, Stack, Typography } from "@mui/material";
import { format } from "date-fns";
import { Money, Todo, FormType, Health } from "../types";
import { useCommonContext } from "../context/CommonContext";
import DailyMoneySummary from "./DailyMoneySummary";
import DailyTodoLists from "./DailyTodoLists";
import DailyHealthSummary from "./DailyHealthSummary";

interface DailyInfoProps {
  currentDay: string;
  dailyMoneyData: Money[];
  dailyTodoData: Todo[];
  todayAndYesterdayHealthData: {
    today: Health | undefined;
    yesterday: Health | undefined;
  };
  toggleForm: (type: FormType) => void;
  onSelectMoneyData: (data: Money) => void;
  onSelectTodoData: (data: Todo) => void;
}

const DailyInfo = ({
  currentDay,
  dailyMoneyData,
  dailyTodoData,
  todayAndYesterdayHealthData,
  toggleForm,
  onSelectMoneyData,
  onSelectTodoData,
}: DailyInfoProps) => {
  const menuDrawerWidth = 320;
  const { isMobile, isMobileDrawerOpen, setIsMobileDrawerOpen } =
    useCommonContext();

  // モバイル用のDrawerを閉じる関数
  const closeMobileDrawer = () => {
    setIsMobileDrawerOpen(false);
  };

  return (
    <Drawer
      sx={{
        width: isMobile ? "auto" : menuDrawerWidth,
        "& .MuiDrawer-paper": {
          width: isMobile ? "auto" : menuDrawerWidth,
          boxSizing: "border-box",
          ...(isMobile && {
            height: "80vh",
            borderTopRightRadius: 8,
            borderTopLeftRadius: 8,
          }),
          ...(!isMobile && {
            top: 0,
            height: "100vh",
            border: "none",
          }),
        },
      }}
      variant={isMobile ? "temporary" : "permanent"}
      anchor={isMobile ? "bottom" : "right"}
      open={isMobileDrawerOpen}
      onClose={closeMobileDrawer}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      <Stack
        sx={{ height: "100%", overflowY: "auto" }}
        spacing={2}
        padding={2.5}
      >
        <Typography
          component={"h2"}
          fontWeight={"bold"}
          variant="h6"
          className="font-serif"
          sx={{ letterSpacing: "0.025em", fontWeight: 700 }}
        >
          {format(currentDay, "yyyy年M月d日")}
        </Typography>
        <DailyTodoLists
          dailyTodoData={dailyTodoData}
          toggleForm={toggleForm}
          onSelectTodoData={onSelectTodoData}
        />
        <DailyMoneySummary
          dailyMoneyData={dailyMoneyData}
          toggleForm={toggleForm}
          onSelectMoneyData={onSelectMoneyData}
        />
        <DailyHealthSummary
          todayAndYesterdayHealthData={todayAndYesterdayHealthData}
          toggleForm={toggleForm}
        />
      </Stack>
    </Drawer>
  );
};
export default DailyInfo;
