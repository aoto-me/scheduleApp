import React, { useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { CircularProgress, Paper, useTheme } from "@mui/material";
import { calculateTotalTimeTaken } from "../utils/timeTakenCalculations";
import {
  millisecondsToHours,
  timeStringToMilliseconds,
} from "../utils/timeCalculations";
import { Todo } from "../types";
import { useProjectContext } from "../context/ProjectContext";
import { useTodoContext } from "../context/TodoContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface BarDataset {
  label: string;
  data: number[];
  backgroundColor: string;
}

function ProjectBarChart() {
  const theme = useTheme();
  const {
    selectedProjectId,
    selectedSectionDataArr,
    isProjectLoading,
    isSectionLoading,
  } = useProjectContext();
  const { todoData, timeTakenData, isTodoLoading, isTimeTakenLoading } =
    useTodoContext();
  const [projectTodoData, setProjectTodoData] = React.useState<Todo[]>([]);
  const [selectedSectionIds, setSelectedSectionIds] = React.useState<number[]>(
    [],
  );
  const [groupedTodoData, setGroupedTodoData] = React.useState<
    {
      sectionId: number;
      todos: Todo[];
    }[]
  >([]);
  const [barDatasets, setBarDatasets] = React.useState<BarDataset[]>([]);

  useEffect(() => {
    const newSelectedSectionIds = selectedSectionDataArr.map(
      (section) => section.id,
    );
    const newProjectTodoData = todoData.filter(
      (todo) => todo.projectId === selectedProjectId,
    );
    if (newProjectTodoData.find((todo) => todo.sectionId === 0)) {
      newSelectedSectionIds.unshift(0);
    }
    setSelectedSectionIds(newSelectedSectionIds);
    setProjectTodoData(newProjectTodoData);
  }, [selectedProjectId, selectedSectionDataArr, todoData]);

  useEffect(() => {
    const newGroupedTodoData = selectedSectionIds.map((sectionId) => ({
      sectionId,
      todos: projectTodoData.filter((item) => item.sectionId === sectionId),
    }));
    setGroupedTodoData(newGroupedTodoData);
  }, [selectedSectionIds, projectTodoData]);

  useEffect(() => {
    const newbarDatasets: BarDataset[] = [];
    const groupLength = groupedTodoData.length;
    const opacity = (1 / groupLength).toFixed(3);
    groupedTodoData.forEach((group, index) => {
      let totalTimeTakenMs = 0;
      let totalEstimatedMs = 0;
      group.todos.forEach((todo) => {
        // timeTaken を抽出して集計する
        const timeTakenArr = timeTakenData.filter(
          (timeTaken) => timeTaken.todoId === todo.id,
        );
        const { ms } = calculateTotalTimeTaken(timeTakenArr, todo.date);
        totalTimeTakenMs += ms;
        // 見積時間を集計する
        totalEstimatedMs += timeStringToMilliseconds(todo.estimated);
      });
      const timeTakenHours = millisecondsToHours(totalTimeTakenMs);
      const estimatedHours = millisecondsToHours(totalEstimatedMs);
      const newDataset = {
        label:
          selectedSectionDataArr.find(
            (section) => section.id === group.sectionId,
          )?.name || "未分類",
        data: [estimatedHours, timeTakenHours],
        backgroundColor: `rgba(146,53,53,${Number(opacity) * (index + 1)})`,
      };
      newbarDatasets.push(newDataset);
    });

    setBarDatasets(newbarDatasets);
  }, [groupedTodoData]);

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        titleFont: { size: 14, family: theme.typography.fontFamily },
        bodyFont: { size: 14, family: theme.typography.fontFamily },
        padding: 10,
      },
      title: {
        display: true,
        text: "作業時間累計",
        color: theme.palette.text.primary,
        font: {
          size: 20,
          family:
            "'Zen Old Mincho', 'Times New Roman', 'ヒラギノ明朝 ProN','Hiragino Mincho ProN', 'Yu Mincho', 'YuMincho', 'Yu Mincho', '游明朝体','ＭＳ 明朝', 'MS Mincho', serif",
        },
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
    scales: {
      x: {
        stacked: true,
        ticks: {
          font: {
            size: 12,
            family: theme.typography.fontFamily,
          },
        },
      },
      y: {
        stacked: true,
        ticks: {
          font: {
            size: 12,
            family: theme.typography.fontFamily,
          },
        },
      },
    },
  };

  const labels = ["見積時間", "作業時間"];

  const data = {
    labels,
    datasets: [...barDatasets],
  };

  return (
    <>
      {barDatasets.length === 0 ? (
        <></>
      ) : (
        <Paper
          sx={{
            mt: 4,
            minHeight: "240px",
            height: "calc( 400px - 25vw)",
            display: "flex",
            flexDirection: "column",
            p: 2,
            borderRadius: "5px",
            overflow: "auto",
            border: "solid 1px #ccc",
          }}
          variant="outlined"
        >
          {isProjectLoading ||
          isSectionLoading ||
          isTodoLoading ||
          isTimeTakenLoading ? (
            <CircularProgress color="secondary" size={30} />
          ) : (
            <Bar options={options} data={data} />
          )}
        </Paper>
      )}
    </>
  );
}

export default ProjectBarChart;
