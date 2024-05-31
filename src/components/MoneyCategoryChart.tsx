import React, { useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import {
  Box,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  useTheme,
} from "@mui/material";
import useFilterCurrentMonthData from "../hooks/useFilterCurrentMonthData";
import { ExpenseCategory, IncomeCategory, MoneyType } from "../types";
import { useMoneyContext } from "../context/MoneyContext";

ChartJS.register(ArcElement, Tooltip, Legend);

function MoneyCategoryChart() {
  const theme = useTheme();
  const { moneyData, isMoneyLoading } = useMoneyContext();
  const monthlyMoneyData = useFilterCurrentMonthData(moneyData);
  const [selectedType, setSlectedType] = useState<MoneyType>("支出");

  // 選択された収支のカテゴリーごとの合計金額を取得
  const categorySums = monthlyMoneyData
    .filter((data) => data.type === selectedType)
    .reduce<Record<IncomeCategory | ExpenseCategory, number>>(
      (acc, cur) => {
        if (!acc[cur.category]) {
          acc[cur.category] = 0;
        }
        acc[cur.category] += Number(cur.amount);
        return acc;
      },
      {} as Record<IncomeCategory | ExpenseCategory, number>,
    );

  const categoryLabels = Object.keys(categorySums) as (
    | IncomeCategory
    | ExpenseCategory
  )[];
  const categoryValues = Object.values(categorySums);

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      tooltip: {
        titleFont: { size: 14, family: theme.typography.fontFamily },
        bodyFont: { size: 14, family: theme.typography.fontFamily },
        padding: 10,
      },
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 14,
            family: theme.typography.fontFamily,
          },
        },
      },
    },
  };

  const getCategoryColor = (
    category: IncomeCategory | ExpenseCategory,
  ): string => {
    const length = categoryValues.length;
    const opacity = (1 / length).toFixed(3);
    const index = categoryLabels.indexOf(category);
    if (selectedType === "収入") {
      return `rgba(72,89,115,${Number(opacity) * (length - index)})`;
    }
    return `rgba(146,53,53,${Number(opacity) * (length - index)})`;
  };

  const data: ChartData<"pie"> = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: categoryLabels.map((label) => getCategoryColor(label)),
        borderColor: categoryLabels.map((label) => getCategoryColor(label)),
        borderWidth: 1,
      },
    ],
  };

  const handleTypeChange = (e: SelectChangeEvent<"収入" | "支出">) => {
    setSlectedType(e.target.value as MoneyType);
  };

  return (
    <>
      <FormControl fullWidth>
        <Select
          labelId="type-select-label"
          id="type-select"
          value={selectedType}
          onChange={handleTypeChange}
          inputProps={{ "aria-label": "表示する収支の種類" }}
          sx={{
            "> .MuiSelect-outlined": {
              padding: "12px 16px",
            },
          }}
        >
          <MenuItem value="収入">収入</MenuItem>
          <MenuItem value="支出">支出</MenuItem>
        </Select>
      </FormControl>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 1,
        }}
      >
        {isMoneyLoading ? (
          <CircularProgress color="secondary" size={30} />
        ) : monthlyMoneyData.length === 0 ? (
          <Typography>データがありません</Typography>
        ) : (
          <Pie data={data} options={options} />
        )}
      </Box>
    </>
  );
}

export default MoneyCategoryChart;
