import React, { useEffect } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import FolderSharpIcon from "@mui/icons-material/FolderSharp";
import ProjectMenu from "../components/ProjectMenu";
import ProjectContent from "../components/ProjectContent";
import ProjectFormArea from "../components/ProjectFormArea";
import { Section, Todo } from "../types";
import { useCommonContext } from "../context/CommonContext";
import { useProjectContext } from "../context/ProjectContext";
import { useTodoContext } from "../context/TodoContext";

export default function Project() {
  const { isMobile } = useCommonContext();
  const { todoData } = useTodoContext();
  const {
    projectData,
    selectedProjectId,
    selectedProjectData,
    setSelectedProjectData,
    sectionData,
    selectedSectionDataArr,
    setSelectedSectionDataArr,
    setIsMenuOpen,
    setSelectedTaskDataArr,
  } = useProjectContext();

  // sectionのidと順序を保持するためのMapを作成する
  const createSectionOrderMap = (sections: Section[]) => {
    const sectionOrderMap: Record<number, number> = {};
    sections.forEach((section, index) => {
      sectionOrderMap[section.id] = index;
    });
    sectionOrderMap[0] = Object.keys(sectionOrderMap).length;
    return sectionOrderMap;
  };

  // sectionの並びとsortを基準にタスクを並び替える
  const sortTasksBySection = ({
    tasks,
    sectionOrderMap,
  }: {
    tasks: Todo[];
    sectionOrderMap: Record<number, number>;
  }) =>
    tasks.sort((a, b) => {
      // sectionIdに基づいて比較
      const sectionComparison =
        sectionOrderMap[a.sectionId] - sectionOrderMap[b.sectionId];
      // sectionIdが同じ場合はsortに基づいて比較
      if (sectionComparison === 0) {
        return a.sort - b.sort;
      }
      return sectionComparison;
    });

  // 選択中のプロジェクトが変更されたときの処理
  useEffect(() => {
    // 選択中のプロジェクトを取得
    const newSelectedProject =
      projectData.find((data) => data.id === selectedProjectId) || null;

    // 選択中のプロジェクトに紐づくセクションを取得
    const newSelectedSection = sectionData.filter(
      (data) => data.projectId === selectedProjectId,
    );
    newSelectedSection.sort((a, b) => a.sort - b.sort);
    const sectionOrderMap = createSectionOrderMap(newSelectedSection);

    // 選択中のプロジェクトに紐づくタスクを抽出
    const filteredSelectedTask = todoData.filter(
      (data) => data.projectId === selectedProjectId,
    );
    const newSelectedTask = sortTasksBySection({
      tasks: filteredSelectedTask,
      sectionOrderMap,
    });
    setSelectedProjectData(newSelectedProject);
    setSelectedSectionDataArr(newSelectedSection);
    setSelectedTaskDataArr(newSelectedTask);
    if (isMobile) {
      setIsMenuOpen(false);
    }
  }, [selectedProjectId, projectData]);

  // sectionが変更されたらselectedSectionDataArrを更新
  useEffect(() => {
    // 選択中のプロジェクトに紐づくセクションを取得
    const newSelectedSection = sectionData.filter(
      (data) => data.projectId === selectedProjectId,
    );
    newSelectedSection.sort((a, b) => a.sort - b.sort);
    setSelectedSectionDataArr(newSelectedSection);
    if (isMobile) {
      setIsMenuOpen(false);
    }
  }, [sectionData]);

  // todoDataが変更されたらselectedTaskDataArrを取得し直す
  useEffect(() => {
    const filteredSelectedTask = todoData.filter(
      (data) => data.projectId === selectedProjectId,
    );
    const sectionOrderMap = createSectionOrderMap(selectedSectionDataArr);
    const newSelectedTask = sortTasksBySection({
      tasks: filteredSelectedTask,
      sectionOrderMap,
    });
    setSelectedTaskDataArr(newSelectedTask);
  }, [todoData]);

  // フォルダボタンをクリックしたときにプロジェクト一覧のメニューを開く
  const handleMenuOpen = () => {
    setIsMenuOpen(true);
  };

  return (
    <Box
      pt={{ xs: 5, md: 0 }}
      sx={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <IconButton
        aria-label="プロジェクトメニューの開閉"
        onClick={handleMenuOpen}
        sx={{
          position: "fixed",
          top: "11px",
          left: "65px",
          borderRadius: "3px",
          border: "1px solid",
          borderColor: "#555",
          lineHeight: 0,
          zIndex: 10,
          backgroundImage:
            "linear-gradient(180deg, rgba(247, 244, 240, 0.93), rgba(247, 244, 240, 0.93)), url(/img/noise.webp)",
          backgroundSize: "auto, 125px",
          ...(isMobile && {
            display: "block",
          }),
          ...(!isMobile && {
            display: "none",
          }),
          "&&:hover": {
            backgroundImage:
              "linear-gradient(180deg, rgba(210, 210, 210, 0.93), rgba(210, 210, 210, 0.93)), url(/img/noise.webp)",
          },
        }}
      >
        <FolderSharpIcon color="primary" />
      </IconButton>
      <Box sx={{ backgroundColor: "#fff" }}>
        <ProjectMenu />
      </Box>
      {selectedProjectData === null ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{
            p: "2rem min(4vw, 1.5rem)",
            flexGrow: 1,
          }}
        >
          <Typography variant="h6" fontWeight={700} className="font-serif">
            プロジェクトを選択してください
          </Typography>
        </Box>
      ) : (
        <ProjectContent />
      )}
      <ProjectFormArea />
    </Box>
  );
}
