import React from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  IconButton,
  List,
  ListItem,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import FeedSharpIcon from "@mui/icons-material/FeedSharp";
import AddCircleSharpIcon from "@mui/icons-material/AddCircleSharp";
import MoreVertSharpIcon from "@mui/icons-material/MoreVertSharp";
import EventNoteSharpIcon from "@mui/icons-material/EventNoteSharp";
import TimerSharpIcon from "@mui/icons-material/TimerSharp";
import { format } from "date-fns";
import { useDrop } from "react-dnd";
import { todoDarkColor, todoMainColor } from "../utils/todoColoer";
import { calculateTotalTimeTaken } from "../utils/timeTakenCalculations";
import { useToggleTodoCompleted } from "../utils/toggleTodoCompleted";
import DraggableTask from "./DraggableTask";
import { Todo, TaskWithIndex, Section, TaskDragHandler } from "../types";
import { useTodoContext } from "../context/TodoContext";
import { useProjectContext } from "../context/ProjectContext";

const SectionBoard: React.FC<{
  section: Section;
  tasks: Todo[];
  sectionId: number;
  firstIndex: number;
  swapItems: TaskDragHandler;
}> = ({ section, tasks, sectionId, firstIndex, swapItems }) => {
  const theme = useTheme();
  const { timeTakenData, setSelectedTodoData, setSelectedTimeTakenData } =
    useTodoContext();
  const { isDrag, handleFormOpen, setSelectedSectionData } =
    useProjectContext();

  // ドロップ領域の設定
  const [, ref] = useDrop({
    accept: "task",
    hover(dragItem: TaskWithIndex) {
      const dragIndex = dragItem.index;
      if (dragItem.sectionId === sectionId) return;
      if (isDrag === true) return;
      const targetIndex =
        dragIndex < firstIndex
          ? // forward
            firstIndex + tasks.length - 1
          : // backward
            firstIndex + tasks.length;
      swapItems(dragIndex, targetIndex, sectionId);
      /* eslint-disable */
      dragItem.index = targetIndex;
      dragItem.sectionId = sectionId;
      /* eslint-disable */
    },
  });

  // カード上のチェックボックスクリック時に、Todoの完了状態を切り替えとデータを更新
  const toggleTodoCompleted = useToggleTodoCompleted();

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      ref={ref}
      sx={{ height: "100%" }}
      padding={section.id === 0 ? "1rem" : "0"}
    >
      <Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Typography
            fontWeight={700}
            lineHeight={1.35}
            sx={{
              fontSize: "clamp(1rem, 6vw, 1.2rem)",
            }}
          >
            {section.name}
          </Typography>
          {section.id !== 0 && (
            <IconButton
              aria-label="セクションを編集"
              size="small"
              color="secondary"
              sx={{ borderRadius: "4px", ml: 0.5 }}
              onClick={() => {
                setSelectedSectionData(section);
                handleFormOpen("section");
              }}
            >
              <MoreVertSharpIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        {section.memo !== "" && (
          <Typography variant="caption" lineHeight={1.35} component="p" mt={1}>
            {section.memo.split("\n").map((line, memoIndex) => (
              <React.Fragment key={memoIndex}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </Typography>
        )}
      </Box>
      <List
        sx={{
          minHeight: "100px",
          flexGrow: 0.5,
          padding: "1rem 0 0.5rem 0",
        }}
      >
        {tasks.map((task, i) => {
          // 現在のTodoDataのIDに基づいてTimeTakenデータを取得
          const relationTimeTaken = timeTakenData.filter(
            (data) => data.todoId === task.id,
          );
          // TimeTakenデータから作業時間の合計時間を計算
          const timeTakenTime = calculateTotalTimeTaken(
            relationTimeTaken,
            task.date,
          );
          return (
            <ListItem key={task.id} disablePadding sx={{ mt: 1 }}>
              <DraggableTask
                item={task}
                index={firstIndex + i}
                swapItems={swapItems}
              >
                <Card
                  variant="outlined"
                  sx={{
                    width: "100%",
                    backgroundColor: "#f9f9f9",
                    borderLeft: `solid 3px ${todoDarkColor(task.type, theme)}`,
                    position: "relative",
                    filter:
                      task.completed === 1
                        ? "contrast(0.8) opacity(0.75) grayscale(0.75)"
                        : "none",
                  }}
                  onClick={(e) => {
                    if ((e.target as Element).tagName === "INPUT") return;
                    setSelectedTodoData(task);
                    setSelectedTimeTakenData(
                      timeTakenData.filter((item) => item.todoId === task?.id),
                    );
                    handleFormOpen("task");
                  }}
                >
                  <Checkbox
                    checked={Boolean(Number(task.completed) === 1)}
                    onClick={() => {
                      toggleTodoCompleted(task);
                    }}
                    sx={{
                      padding: 0,
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      color: todoDarkColor(task.type, theme),
                      "&.Mui-checked": {
                        color: todoDarkColor(task.type, theme),
                      },
                    }}
                  />
                  <CardActionArea>
                    <CardContent sx={{ padding: 1.5 }}>
                      <Stack>
                        {/* 内容 */}
                        <Box flexGrow={1}>
                          <Typography
                            variant="body2"
                            lineHeight={1.35}
                            fontWeight={700}
                            sx={{
                              paddingLeft: 3.5,
                            }}
                          >
                            {task.content}
                          </Typography>
                        </Box>
                        {/* 日付 */}
                        <Stack
                          direction={"row"}
                          alignItems="center"
                          marginTop={1}
                        >
                          <Box flexGrow={0} flexShrink={0} marginRight={1}>
                            <EventNoteSharpIcon
                              fontSize="small"
                              sx={{
                                verticalAlign: "text-bottom",
                                color: todoMainColor(task.type, theme),
                              }}
                            />
                          </Box>
                          <Box flexGrow={1} flexShrink={1}>
                            <Typography
                              lineHeight={1.35}
                              letterSpacing={0.5}
                              fontWeight={500}
                              variant="caption"
                              component={"time"}
                              dateTime={format(
                                `${task.date} ${task.time}`,
                                "yyyy-MM-dd'T'HH:mm:ss",
                              )}
                            >
                              {format(task.date, "yyyy年M月d日")}
                              {task.time !== "00:00:00" &&
                                format(`${task.date} ${task.time}`, " H:mm")}
                            </Typography>
                          </Box>
                        </Stack>
                        {/* 作業時間 */}
                        {relationTimeTaken.length === 0 &&
                        (task.estimated === "00:00:00" ||
                          task.estimated === "00:00") ? (
                          <></>
                        ) : (
                          <Stack
                            direction={"row"}
                            alignItems="center"
                            marginTop={0.75}
                          >
                            <Box flexGrow={0} flexShrink={0} marginRight={1}>
                              <TimerSharpIcon
                                fontSize="small"
                                sx={{
                                  verticalAlign: "text-bottom",
                                  color: todoMainColor(task.type, theme),
                                }}
                              />
                            </Box>
                            <Box flexGrow={1} flexShrink={1}>
                              <Typography
                                lineHeight={1.35}
                                letterSpacing={0.5}
                                variant="caption"
                              >
                                {timeTakenTime.hours === 0 &&
                                  timeTakenTime.minutes === 0 &&
                                  "0時間"}
                                {timeTakenTime.hours !== 0 &&
                                  `${timeTakenTime.hours}時間`}
                                {timeTakenTime.minutes !== 0 &&
                                  `${timeTakenTime.minutes}分`}
                              </Typography>
                            </Box>
                            {task.estimated !== "00:00:00" &&
                              task.estimated !== "00:00" && (
                                <Box flexGrow={0} flexShrink={1} ml={2}>
                                  <Typography
                                    variant="caption"
                                    mr={0.5}
                                    sx={{
                                      padding: "1px 6px",
                                      border: "1px solid #888",
                                      borderRadius: "999px",
                                      fontSize: "0.6rem",
                                      verticalAlign: "middle",
                                    }}
                                  >
                                    見積
                                  </Typography>
                                  <Typography variant="caption">
                                    {format(
                                      `${task.date} ${task.estimated}`,
                                      "H",
                                    ) !== "0" &&
                                      format(
                                        `${task.date} ${task.estimated}`,
                                        "H時間",
                                      )}
                                    {format(
                                      `${task.date} ${task.estimated}`,
                                      "m",
                                    ) !== "0" &&
                                      format(
                                        `${task.date} ${task.estimated}`,
                                        "m分",
                                      )}
                                  </Typography>
                                </Box>
                              )}
                          </Stack>
                        )}

                        {/*relationTimeTaken.length > 0 && (
                          <Stack
                            direction={"row"}
                            alignItems="center"
                            marginTop={0.75}
                          >
                            <Box flexGrow={0} flexShrink={0} marginRight={1}>
                              <TimerSharpIcon
                                fontSize="small"
                                sx={{
                                  verticalAlign: "text-bottom",
                                  color: todoMainColor(task.type, theme),
                                }}
                              />
                            </Box>
                            <Box flexGrow={1} flexShrink={1}>
                              <Typography
                                lineHeight={1.35}
                                letterSpacing={0.5}
                                variant="caption"
                              >
                                {timeTakenTime.hours === 0 &&
                                  timeTakenTime.minutes === 0 &&
                                  "0時間"}
                                {timeTakenTime.hours !== 0 &&
                                  `${timeTakenTime.hours}時間`}
                                {timeTakenTime.minutes !== 0 &&
                                  `${timeTakenTime.minutes}分`}
                              </Typography>
                            </Box>
                            {task.estimated !== "00:00:00" &&
                              task.estimated !== "00:00" && (
                                <Box flexGrow={0} flexShrink={1} ml={2}>
                                  <Typography
                                    variant="caption"
                                    mr={0.75}
                                    sx={{
                                      padding: "1px 6px",
                                      border: "1px solid #888",
                                      borderRadius: "999px",
                                      fontSize: "0.6rem",
                                      verticalAlign: "middle",
                                    }}
                                  >
                                    見積
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    letterSpacing={0.5}
                                  >
                                    {format(
                                      `${task.date} ${task.estimated}`,
                                      "H",
                                    ) !== "0" &&
                                      format(
                                        `${task.date} ${task.estimated}`,
                                        "H時間",
                                      )}
                                    {format(
                                      `${task.date} ${task.estimated}`,
                                      "m",
                                    ) !== "0" &&
                                      format(
                                        `${task.date} ${task.estimated}`,
                                        "m分",
                                      )}
                                  </Typography>
                                </Box>
                              )}
                          </Stack>
                        ) */}
                        {task.memo !== "" && (
                          <Stack
                            direction={"row"}
                            alignItems="flex-start"
                            marginTop={0.5}
                          >
                            <Box flexGrow={0} flexShrink={0} marginRight={1}>
                              <FeedSharpIcon
                                fontSize="small"
                                sx={{
                                  color: todoMainColor(task.type, theme),
                                }}
                              />
                            </Box>
                            <Box>
                              <Typography
                                variant="caption"
                                lineHeight={1.35}
                                display={"block"}
                                sx={{ pt: "2px" }}
                              >
                                {task.memo
                                  .split("\n")
                                  .map((line, memoIndex) => (
                                    <React.Fragment key={memoIndex}>
                                      {line}
                                      <br />
                                    </React.Fragment>
                                  ))}
                              </Typography>
                            </Box>
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </DraggableTask>
            </ListItem>
          );
        })}
      </List>
      {section.id !== 0 && (
        <Button
          startIcon={<AddCircleSharpIcon />}
          fullWidth
          variant="text"
          color="primary"
          onClick={() => {
            setSelectedSectionData(section);
            setSelectedTodoData(null);
            handleFormOpen("task");
          }}
          sx={{
            padding: 0.5,
            marginTop: "auto",
            borderColor: (theme) => theme.palette.primary.main,
          }}
        >
          タスクを追加
        </Button>
      )}
    </Box>
  );
};

export default SectionBoard;
