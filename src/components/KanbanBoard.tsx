import React, { useCallback } from "react";
import { Box, Button, Grid } from "@mui/material";
import AddCircleSharpIcon from "@mui/icons-material/AddCircleSharp";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import axios from "axios";
import DraggableSection from "./DraggableSection";
import SectionBoard from "./SectionBoard";
import { ResponseData, TaskDragHandler } from "../types";
import { useProjectContext } from "../context/ProjectContext";
import { useTodoContext } from "../context/TodoContext";
import { useCommonContext } from "../context/CommonContext";

function KanbanBoard() {
  const { userId, csrfToken } = useCommonContext();
  const {
    handleFormOpen,
    setSectionData,
    selectedSectionDataArr,
    setSelectedSectionDataArr,
    selectedTaskDataArr,
    setSelectedTaskDataArr,
    setIsDrag,
    setSelectedSectionData,
    selectedProjectId,
  } = useProjectContext();
  const { setTodoData } = useTodoContext();

  // タスクの順番入れ替え
  const swapTask: TaskDragHandler = useCallback(
    (dragIndex, targetIndex, sectionId) => {
      // dragIndexとtargetIndexからswap処理
      setIsDrag(true);
      const item = selectedTaskDataArr[dragIndex];
      if (!item) {
        setIsDrag(false);
        return;
      }
      // 新しいselectedTaskDataArrを作成
      const newItems = selectedTaskDataArr.filter(
        (data) => data.id !== item.id,
      );
      newItems.splice(targetIndex, 0, { ...item, sectionId });
      for (let i = 0; i < newItems.length; i += 1) {
        newItems[i].sort = i;
      }
      // データベースの更新
      const apiUrl = process.env.REACT_APP_SORT_API;
      const urlSearchParams = new URLSearchParams();
      newItems.forEach((obj, index) => {
        for (const [key, value] of Object.entries(obj)) {
          urlSearchParams.append(
            `${key}[${index}]`,
            (value as string | number).toString(),
          );
        }
      });
      urlSearchParams.append("userId", userId);
      urlSearchParams.append("csrfToken", csrfToken);
      urlSearchParams.append("tableType", "todo");
      if (!apiUrl) {
        console.error("APIが設定されていません");
        return;
      }
      axios
        .post<ResponseData>(apiUrl, urlSearchParams)
        .then((response) => {
          // 通信成功
          if (response.data.success) {
            // 大元であるTodoDataを更新
            setTodoData((prev) => {
              const newTodoData = [...prev];
              // newItemsの内容に基づいてTodoDataを更新
              newItems.forEach((selectedTodo) => {
                const index = newTodoData.findIndex(
                  (todo) => todo.id === selectedTodo.id,
                );
                if (index !== -1) {
                  // 該当するtodoのsortをnewItemsのsortに更新
                  newTodoData[index].sort = selectedTodo.sort;
                  newTodoData[index].sectionId = selectedTodo.sectionId;
                }
              });
              return newTodoData;
            });
          } else {
            console.error(response.data.error);
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => setIsDrag(false));
    },
    [selectedTaskDataArr, setSelectedTaskDataArr],
  );

  // セクションの順番入れ替え
  const swapSection = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      // dragIndexとhoverIndexからswap処理
      const item = selectedSectionDataArr[dragIndex];
      if (!item) return;
      // 新しいselectedSectionDataArrを作成
      const newItems = selectedSectionDataArr.filter(
        (data) => data.id !== item.id,
      );
      // hoverIndexの位置にdragIndexのセクションを挿入
      newItems.splice(hoverIndex, 0, { ...selectedSectionDataArr[dragIndex] });
      for (let i = 0; i < newItems.length; i += 1) {
        newItems[i].sort = i;
      }
      // データベースの更新
      const apiUrl = process.env.REACT_APP_SORT_API;
      const urlSearchParams = new URLSearchParams();
      newItems.forEach((obj, index) => {
        for (const [key, value] of Object.entries(obj)) {
          urlSearchParams.append(
            `${key}[${index}]`,
            (value as string | number).toString(),
          );
        }
      });
      urlSearchParams.append("userId", userId);
      urlSearchParams.append("csrfToken", csrfToken);
      urlSearchParams.append("tableType", "section");
      if (!apiUrl) {
        console.error("APIが設定されていません");
        return;
      }
      axios
        .post<ResponseData>(apiUrl, urlSearchParams)
        .then((response) => {
          // 通信成功
          if (response.data.success) {
            // 取得済みのデータを更新する
            setSectionData((prev) => {
              const updatedSectionData = [...prev];
              // selectedSectionDataArrの内容に基づいてupdatedSectionDataを更新
              newItems.forEach((selectedSection) => {
                const index = updatedSectionData.findIndex(
                  (section) => section.id === selectedSection.id,
                );
                if (index !== -1) {
                  // 該当するsectionのsortをselectedSectionのsortに更新
                  updatedSectionData[index].sort = selectedSection.sort;
                }
              });
              return updatedSectionData;
            });
          } else {
            console.error(response.data.error);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    [selectedSectionDataArr, setSelectedSectionDataArr],
  );

  let index = 0;
  return (
    <DndProvider backend={HTML5Backend}>
      <Grid
        container
        mt={3}
        spacing={2}
        sx={{ backgroundColor: "transparent" }}
      >
        {selectedSectionDataArr.map((section, sectionIndex) => {
          // sectionに紐づくタスクを抽出
          const tasks = selectedTaskDataArr.filter(
            (task) => task.sectionId === section.id,
          );
          const firstIndex = index;
          if (tasks === undefined) return null;
          index += tasks.length;
          return (
            <Grid item key={section.id} xs={12} sm={6} md={4}>
              <Box className="contentBox" sx={{ height: "100%" }}>
                <DraggableSection
                  item={section}
                  index={sectionIndex}
                  swapItems={swapSection}
                >
                  <SectionBoard
                    section={section}
                    tasks={tasks}
                    sectionId={section.id}
                    firstIndex={firstIndex}
                    swapItems={swapTask}
                  />
                </DraggableSection>
              </Box>
            </Grid>
          );
        })}
        {selectedTaskDataArr.filter((task) => task.sectionId === 0).length >
          0 && (
          <Grid item key={0} xs={12} sm={6} md={4}>
            <Box className="contentBox" sx={{ height: "100%" }}>
              <SectionBoard
                section={{
                  id: 0,
                  projectId: selectedProjectId,
                  name: "未分類",
                  sort: selectedSectionDataArr.length,
                  memo: "",
                  dragType: "section",
                }}
                tasks={selectedTaskDataArr.filter(
                  (task) => task.sectionId === 0,
                )}
                sectionId={0}
                firstIndex={index}
                swapItems={swapTask}
              />
            </Box>
          </Grid>
        )}
        {/* セクションを追加ボタン */}
        <Grid item xs={12} sm={6} md={4}>
          <Button
            startIcon={<AddCircleSharpIcon />}
            fullWidth
            variant="outlined"
            color="secondary"
            onClick={() => {
              setSelectedSectionData(null);
              handleFormOpen("section");
            }}
            sx={{
              "&&:hover": {
                borderColor: "rgba(136, 136, 136, 0.5)",
              },
            }}
          >
            セクションを追加
          </Button>
        </Grid>
      </Grid>
    </DndProvider>
  );
}

export default KanbanBoard;
