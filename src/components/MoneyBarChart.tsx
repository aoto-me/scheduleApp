import React, { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartArea,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  Box,
  CircularProgress,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { getYear } from "date-fns";
import { filterMonthlyData } from "../utils/filterDataFn";
import { financeCalculations } from "../utils/financeCalculations";
import { useCommonContext } from "../context/CommonContext";
import { useMoneyContext } from "../context/MoneyContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function MoneyBarChart() {
  const theme = useTheme();
  const chartRef = useRef<ChartJS<"bar"> | undefined>(null);
  const { currentMonth } = useCommonContext();
  const { moneyData, isMoneyLoading } = useMoneyContext();
  const [barChartLabels, setBarChartLabels] = useState<string[]>([]);
  const [barChartIncomes, setBarChartIncomes] = useState<number[]>([]);
  const [barChartExpenses, setBarChartExpenses] = useState<number[]>([]);
  const [barChartBalances, setBarChartBalances] = useState<number[]>([]);
  const [chartData, setChartData] = useState<ChartData<"bar">>({
    datasets: [],
  });

  useEffect(() => {
    // 年を取得
    const year = getYear(currentMonth);

    // 月のラベルを作成
    const labels = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      return `${month}月`;
    });
    setBarChartLabels(labels);

    // 1年間の収支のデータを計算
    const eachMonthFinance = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const target = new Date(year, month - 1, 1);
      const filteredData = filterMonthlyData(moneyData, target);
      return financeCalculations(filteredData);
    });

    const incomes = eachMonthFinance.map((item) => item.income);
    setBarChartIncomes(incomes);
    const expenses = eachMonthFinance.map((item) => item.expense);
    setBarChartExpenses(expenses);
    const balances = eachMonthFinance.map((item) => item.balance);
    setBarChartBalances(balances);
  }, [currentMonth, moneyData]);

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
      title: {
        display: true,
        text: "月別収支",
        color: theme.palette.text.primary,
        font: {
          size: 20,
          family:
            "'Zen Old Mincho', 'Times New Roman', 'ヒラギノ明朝 ProN','Hiragino Mincho ProN', 'Yu Mincho', 'YuMincho', 'Yu Mincho', '游明朝体','ＭＳ 明朝', 'MS Mincho', serif",
        },
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
        ticks: {
          font: {
            size: 12,
            family: theme.typography.fontFamily,
          },
        },
      },
    },
  };

  const data = {
    labels: barChartLabels,
    datasets: [
      {
        label: "収入",
        data: barChartIncomes,
      },
      {
        label: "支出",
        data: barChartExpenses,
      },
      {
        label: "収支",
        data: barChartBalances,
      },
    ],
  };

  function createGradient(
    ctx: CanvasRenderingContext2D,
    area: ChartArea,
    label: string,
  ) {
    let colorStart = "";
    let colorEnd = "";

    // 各データセットのラベルに応じて色を設定
    switch (label) {
      case "収入":
        colorStart = alpha(theme.palette.incomeColor.light, 0.3);
        colorEnd = theme.palette.incomeColor.dark;
        break;
      case "支出":
        colorStart = alpha(theme.palette.expenseColor.light, 0.3);
        colorEnd = theme.palette.expenseColor.dark;
        break;
      case "収支":
        colorStart = alpha(theme.palette.balanceColor.light, 0.3);
        colorEnd = theme.palette.balanceColor.dark;
        break;
      default:
        colorStart = "#ffffff";
        colorEnd = "#000000";
        break;
    }

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
        backgroundColor: createGradient(
          chart.ctx,
          chart.chartArea,
          dataset.label,
        ),
      })),
    };
    setChartData(newChartData);
  }, [barChartBalances, barChartExpenses, barChartIncomes]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minWidth: "500px",
      }}
    >
      {isMoneyLoading ? (
        <CircularProgress color="secondary" size={30} />
      ) : barChartIncomes.every((num) => num === 0) &&
        barChartIncomes.every((num) => num === 0) ? (
        <Typography>データがありません</Typography>
      ) : (
        <Bar ref={chartRef} data={chartData} options={options} />
      )}
    </Box>
  );
}

export default MoneyBarChart;
