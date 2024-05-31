import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { format } from "date-fns";
import Calendar from "../components/Calendar";
import DailyInfo from "../components/DailyInfo";
import FormArea from "../components/FormArea ";
import useFilterCurrentMonthData from "../hooks/useFilterCurrentMonthData";
import MonthlyMemoArea from "../components/MonthlyMemoArea";
import useFilterTodayAndYesterdayData from "../hooks/useFilterTodayAndYesterdayData";
import useFilterDailyData from "../hooks/useFilterDailyData";
import { Money, Todo, FormType } from "../types";
import { useHealthContext } from "../context/HealthContext";
import { useTodoContext } from "../context/TodoContext";
import { useMoneyContext } from "../context/MoneyContext";
import { useCommonContext } from "../context/CommonContext";

const Home = () => {
  const toDay = format(new Date(), "yyyy-MM-dd");
  const [currentDay, setCurrentDay] = useState(toDay);
  const [isFormType, setIsFormType] = useState<FormType>("none" as FormType);
  const {
    isMobile,
    setIsDialogOpen,
    isDialogOpen,
    setIsEntryDrawerOpen,
    isEntryDrawerOpen,
  } = useCommonContext();
  const {
    todoData,
    setSelectedTodoData,
    timeTakenData,
    setSelectedTimeTakenData,
    selectedTodoData,
  } = useTodoContext();
  const { moneyData, setSelectedMoneyData, selectedMoneyData } =
    useMoneyContext();
  const { healthData, setSelectedHealthData } = useHealthContext();

  const monthlyTodoData = useFilterCurrentMonthData(todoData);
  const dailyTodoData = useFilterDailyData(monthlyTodoData, currentDay);
  const monthlyMoneyData = useFilterCurrentMonthData(moneyData);
  const dailyMoneyData = useFilterDailyData(monthlyMoneyData, currentDay);
  const dailyHealthData = useFilterDailyData(healthData, currentDay);
  const todayAndYesterdayHealthData = useFilterTodayAndYesterdayData(
    healthData,
    currentDay,
  );

  // フォームを閉じる
  const closeForm = () => {
    setSelectedMoneyData(null);
    setSelectedTodoData(null);
    setSelectedTimeTakenData([]);
    if (isMobile) {
      setIsDialogOpen(false);
    } else {
      setIsEntryDrawerOpen(false);
    }
  };

  // フォームの開閉処理
  const toggleForm = (type: FormType) => {
    // WARNING：isFormType !== typeのあとにisFormTypeを更新した方が自然な流れなのに、先にsetIsFormType()を実行した方が正しい挙動になる
    setIsFormType(type);
    if (isEntryDrawerOpen === true && isFormType !== type) return;
    if (isMobile) {
      setIsDialogOpen(!isDialogOpen);
    } else if (selectedMoneyData !== null && type === "money") {
      // 取引が選択されている場合はselectedMoneyDataをnullにして、開閉しない
      setSelectedMoneyData(null);
    } else if (selectedTodoData !== null && type === "todo") {
      // 取引が選択されている場合はselectedMoneyDataをnullにして、開閉しない
      setSelectedTodoData(null);
      setSelectedTimeTakenData([]);
    } else {
      // 取引が選択されていない場合はフォームを開く
      setIsEntryDrawerOpen(!isEntryDrawerOpen);
    }
  };

  // 既存の取引データ選択時の処理;
  const onSelectMoneyData = (data: Money) => {
    setIsFormType("money");
    setSelectedMoneyData(data);
    setSelectedTodoData(null);
    // setSelectedHealthData(null);
    if (isMobile) {
      setIsDialogOpen(true);
    } else {
      setIsEntryDrawerOpen(true);
    }
  };

  const onSelectTodoData = (data: Todo) => {
    setIsFormType("todo");
    setSelectedTodoData(data);
    setSelectedMoneyData(null);
    // setSelectedHealthData(null);
    setSelectedTimeTakenData(
      timeTakenData.filter((item) => item.todoId === data?.id),
    );
    if (isMobile) {
      setIsDialogOpen(true);
    } else {
      setIsEntryDrawerOpen(true);
    }
  };

  useEffect(() => {
    if (dailyHealthData.length > 0) {
      setSelectedHealthData(dailyHealthData[0]);
    } else {
      setSelectedHealthData(null);
    }
  }, [currentDay, dailyHealthData]);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        flexDirection="column"
        sx={{
          flexGrow: 1,
        }}
        onClick={(e) => {
          const tagName = (e.target as Element).tagName;
          if (["svg", "TEXTAREA"].includes(tagName)) return;
          closeForm();
        }}
      >
        <Calendar
          currentDay={currentDay}
          setCurrentDay={setCurrentDay}
          toDay={toDay}
        />
        <MonthlyMemoArea pageType="home" />
      </Box>

      <Box>
        <DailyInfo
          currentDay={currentDay}
          dailyMoneyData={dailyMoneyData}
          dailyTodoData={dailyTodoData}
          todayAndYesterdayHealthData={todayAndYesterdayHealthData}
          toggleForm={toggleForm}
          onSelectMoneyData={onSelectMoneyData}
          onSelectTodoData={onSelectTodoData}
        />
        <FormArea
          isEntryDrawerOpen={isEntryDrawerOpen}
          closeForm={closeForm}
          currentDay={currentDay}
          isFormTypes={isFormType}
          setIsFormType={setIsFormType}
        />
      </Box>
    </Box>
  );
};

export default Home;
