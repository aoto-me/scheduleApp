import React, { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ChartArea,
  ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  Box,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { format, getYear } from "date-fns";
import useFilterCurrentMonthData from "../hooks/useFilterCurrentMonthData";
import { calculateAverageBodyWeight } from "../utils/weightCalculations";
import { Health } from "../types";
import { useCommonContext } from "../context/CommonContext";
import { useHealthContext } from "../context/HealthContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
);

interface BodyWeightData {
  date: string;
  body: number;
}

function BodyWeightChart() {
  const theme = useTheme();
  const chartRef = useRef<ChartJS<"line"> | undefined>(null);
  const { currentMonth } = useCommonContext();
  const { healthData, isHealthLoading } = useHealthContext();
  const monthlyHealthData = useFilterCurrentMonthData(healthData);
  const [selectedDataType, setSelectedDataType] = useState<"month" | "year">(
    "month",
  );
  const [chartMonthlyBodyWeight, setChartMonthlyBodyWeight] = useState<
    BodyWeightData[]
  >([]);
  const [chartAverageBodyWeight, setChartAverageBodyWeight] = useState<
    BodyWeightData[]
  >([]);
  const [chartData, setChartData] = useState<ChartData<"line">>({
    datasets: [],
  });

  // 月別の平均体重を計算
  const calculateAverageBodyWeightForYear = () => {
    // 年を取得
    const year = getYear(currentMonth);
    // 月別データの取得
    const monthlyDataForYear = [];
    for (let i = 1; i <= 12; i += 1) {
      const filteredMonthData = healthData.filter((data) =>
        data.date.startsWith(`${year}-${i.toString().padStart(2, "0")}`),
      );
      monthlyDataForYear.push([...filteredMonthData]);
    }
    // 月別の体重データを計算
    const bodyWeightDataForYear = [];
    for (let i = 0; i < 12; i += 1) {
      const monthAverageWeight = calculateAverageBodyWeight(
        monthlyDataForYear[i],
      );
      if (monthAverageWeight !== 0) {
        bodyWeightDataForYear.push({
          date: `${i + 1}月`,
          body: monthAverageWeight,
        });
      }
    }
    return bodyWeightDataForYear;
  };

  // 今月の各日の体重を取得
  const filterBodyWeightData = (
    data: Health[],
  ): { date: string; body: number }[] => {
    const bodyWeightData: { date: string; body: number }[] = [];
    // 月間のデータを日付順にソート
    const sortedData = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    sortedData.forEach((item) => {
      if (Number(item.body) !== 0) {
        bodyWeightData.push({
          date: format(item.date, "d日"),
          body: Number(item.body),
        });
      }
    });
    return bodyWeightData;
  };

  // グラフのデータを更新
  useEffect(() => {
    const bodyWeightData = filterBodyWeightData(monthlyHealthData);
    setChartMonthlyBodyWeight(bodyWeightData);
    const averageBodyWeight = calculateAverageBodyWeightForYear();
    setChartAverageBodyWeight(averageBodyWeight);
  }, [currentMonth, healthData]);

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
            size: 16,
            family: theme.typography.fontFamily,
          },
        },
      },
      title: {
        display: false,
      },
    },

    scales: {
      x: {
        ticks: {
          font: {
            size: 12,
            family: theme.typography.fontFamily,
          },
        },
      },
      y: {
        suggestedMin: 38,
        ticks: {
          font: {
            size: 12,
            family: theme.typography.fontFamily,
          },
        },
      },
    },
  };

  const handleDataTypeChange = (e: SelectChangeEvent<"month" | "year">) => {
    setSelectedDataType(e.target.value as "month" | "year");
  };

  // ラベルの表示を切り替え
  const labels = (dataType: "month" | "year") => {
    if (dataType === "month")
      return Object.values(chartMonthlyBodyWeight).map((data) => data.date);
    return Object.values(chartAverageBodyWeight).map((data) => data.date);
  };

  // データの表示を切り替え
  const selectedChartData = (dataType: "month" | "year") => {
    if (dataType === "month")
      return Object.values(chartMonthlyBodyWeight).map((data) => data.body);
    return Object.values(chartAverageBodyWeight).map((data) => data.body);
  };

  // グラフタイトルを切り替え
  const label = (dataType: "month" | "year") => {
    if (dataType === "month") return "体重";
    return "月間平均体重";
  };

  const data = {
    labels: labels(selectedDataType),
    datasets: [
      {
        fill: true,
        label: label(selectedDataType),
        data: selectedChartData(selectedDataType),
        borderColor: theme.palette.expenseColor.dark,
      },
    ],
  };

  // グラデーションを作成
  function createGradient(ctx: CanvasRenderingContext2D, area: ChartArea) {
    const colorStart = alpha(theme.palette.expenseColor.dark, 0.05);
    const colorEnd = alpha(theme.palette.expenseColor.dark, 0.8);
    const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
  }

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) {
      return;
    }
    const newChartData = {
      ...data,
      datasets: data.datasets.map((dataset) => ({
        ...dataset,
        backgroundColor: createGradient(chart.ctx, chart.chartArea),
      })),
    };
    setChartData(newChartData);
  }, [chartMonthlyBodyWeight, chartAverageBodyWeight, selectedDataType]);

  return (
    <>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <Select
          labelId="dataType-select-label"
          id="dataType-select"
          value={selectedDataType}
          onChange={handleDataTypeChange}
          inputProps={{ "aria-label": "表示するデータの種類" }}
          sx={{
            "> .MuiSelect-outlined": {
              padding: "12px 16px",
            },
          }}
        >
          <MenuItem value="month">月間データ</MenuItem>
          <MenuItem value="year">年間データ</MenuItem>
        </Select>
      </FormControl>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minWidth: "450px",
        }}
      >
        {isHealthLoading ? (
          <CircularProgress color="secondary" size={30} />
        ) : chartAverageBodyWeight.length === 0 &&
          chartMonthlyBodyWeight.length === 0 ? (
          <Typography>データがありません</Typography>
        ) : selectedDataType === "month" &&
          chartMonthlyBodyWeight.length === 0 ? (
          <Typography>データがありません</Typography>
        ) : (
          <Line ref={chartRef} data={chartData} options={options} />
        )}
      </Box>
    </>
  );
}

export default BodyWeightChart;
