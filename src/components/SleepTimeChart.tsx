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
  ChartData,
  ChartArea,
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
import { endOfMonth, format, getYear, subMonths } from "date-fns";
import useFilterCurrentMonthAndLastDayOfLastMonthData from "../hooks/useFilterCurrentMonthAndLastDayOfLastMonthData";
import { useCommonContext } from "../context/CommonContext";
import { useHealthContext } from "../context/HealthContext";
import {
  calculateAverageSleepTime,
  calculateSleepTime,
} from "../utils/sleepTimeCalculations";

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

interface SleepTimeData {
  date: string;
  sleepTime: number;
}

function SleepTimeChart() {
  const theme = useTheme();
  const chartRef = useRef<ChartJS<"line"> | undefined>(null);
  const { currentMonth } = useCommonContext();
  const { healthData, isHealthLoading } = useHealthContext();
  const [selectedDataType, setSelectedDataType] = useState<"month" | "year">(
    "month",
  );
  const [chartMonthlySleepData, setChartMonthlySleepData] = useState<
    SleepTimeData[]
  >([]);
  const [chartAverageSleepData, setChartAverageSleepData] = useState<
    SleepTimeData[]
  >([]);
  const [chartData, setChartData] = useState<ChartData<"line">>({
    datasets: [],
  });

  useEffect(() => {
    // 年を取得
    const year = getYear(currentMonth);

    // 月別データの取得
    const monthlyDataForYear = [];
    for (let i = 1; i <= 12; i += 1) {
      const filteredMonthData = healthData.filter((data) =>
        data.date.startsWith(`${year}-${i.toString().padStart(2, "0")}`),
      );
      const lastDay = endOfMonth(subMonths(new Date(year, i - 1, 1), 1));
      const lastDayData = healthData.filter(
        (item) => item.date === format(lastDay, "yyyy-MM-dd"),
      );
      monthlyDataForYear.push([...lastDayData, ...filteredMonthData]);
    }

    // 月別の睡眠時間データを計算
    const sleepTimeDataForYear = [];
    for (let i = 0; i < 12; i += 1) {
      const sleepTimeData = calculateSleepTime(monthlyDataForYear[i], true);
      sleepTimeDataForYear.push([...sleepTimeData]);
    }

    // 各月の平均睡眠時間を計算
    const averageSleepTimeDataForYear = [];
    for (let k = 0; k < 12; k += 1) {
      const { hours } = calculateAverageSleepTime(sleepTimeDataForYear[k]);
      if (hours !== 0) {
        averageSleepTimeDataForYear.push({
          date: `${k + 1}月`,
          sleepTime: hours,
        });
      }
    }
    setChartAverageSleepData(averageSleepTimeDataForYear);
  }, [currentMonth, healthData]);

  // 今月と先月の最終日のデータを取得
  const currentMonthAndLastDayOfLastMonthData =
    useFilterCurrentMonthAndLastDayOfLastMonthData(healthData);
  // 今月の各日の睡眠時間をstateにセット
  useEffect(() => {
    const sleepTimeData = calculateSleepTime(
      currentMonthAndLastDayOfLastMonthData,
    );
    setChartMonthlySleepData(sleepTimeData);
  }, [currentMonth, currentMonthAndLastDayOfLastMonthData]);

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
        beginAtZero: true,
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
      return Object.values(chartMonthlySleepData).map((data) => data.date);
    return Object.values(chartAverageSleepData).map((data) => data.date);
  };

  // データの表示を切り替え
  const selectedChartData = (dataType: "month" | "year") => {
    if (dataType === "month")
      return Object.values(chartMonthlySleepData).map((data) => data.sleepTime);
    return Object.values(chartAverageSleepData).map((data) => data.sleepTime);
  };

  // グラフタイトルを切り替え
  const label = (dataType: "month" | "year") => {
    if (dataType === "month") return "睡眠時間";
    return "月間平均睡眠時間";
  };

  const data = {
    labels: labels(selectedDataType),
    datasets: [
      {
        fill: true,
        label: label(selectedDataType),
        data: selectedChartData(selectedDataType),
        borderColor: theme.palette.incomeColor.dark,
      },
    ],
  };

  // グラデーションを作成
  function createGradient(ctx: CanvasRenderingContext2D, area: ChartArea) {
    const colorStart = alpha(theme.palette.incomeColor.dark, 0.05);
    const colorEnd = alpha(theme.palette.incomeColor.dark, 0.8);
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
  }, [chartAverageSleepData, chartMonthlySleepData, selectedDataType]);

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
        ) : chartAverageSleepData.length === 0 &&
          chartMonthlySleepData.length === 0 ? (
          <Typography>データがありません</Typography>
        ) : selectedDataType === "month" &&
          chartMonthlySleepData.length === 0 ? (
          <Typography>データがありません</Typography>
        ) : (
          <Line ref={chartRef} data={chartData} options={options} />
        )}
      </Box>
    </>
  );
}

export default SleepTimeChart;
