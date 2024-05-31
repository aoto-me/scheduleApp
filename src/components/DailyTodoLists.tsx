import React, { useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  List,
  ListItem,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import FeedSharpIcon from "@mui/icons-material/FeedSharp";
import AddCircleSharpIcon from "@mui/icons-material/AddCircleSharp";
import TimerSharpIcon from "@mui/icons-material/TimerSharp";
import FolderSharpIcon from "@mui/icons-material/FolderSharp";
import { format } from "date-fns";
import { todoDarkColor, todoMainColor } from "../utils/todoColoer";
import { calculateTotalTimeTaken } from "../utils/timeTakenCalculations";
import { useToggleTodoCompleted } from "../utils/toggleTodoCompleted";
import { TimeTaken, Todo, FormType } from "../types";
import { useTodoContext } from "../context/TodoContext";
import { useProjectContext } from "../context/ProjectContext";

interface DailyTodoListsProps {
  dailyTodoData: Todo[];
  toggleForm: (type: FormType) => void;
  onSelectTodoData: (data: Todo) => void;
}

const DailyTodoLists = ({
  dailyTodoData,
  toggleForm,
  onSelectTodoData,
}: DailyTodoListsProps) => {
  const theme = useTheme();
  const [sortedTodoData, setSortedTodoData] = React.useState<Todo[]>([]);
  const { timeTakenData, setSelectedTimeTakenData, setSelectedTodoData } =
    useTodoContext();
  const { projectData } = useProjectContext();

  // タイプの順番に基づいてTodoDataをソートする
  useEffect(() => {
    setSortedTodoData(
      [...dailyTodoData].sort((a, b) => {
        if (a.type === b.type) {
          return 0;
        }
        if (a.type === "仕事") {
          return -1;
        }
        if (b.type === "仕事") {
          return 1;
        }
        if (a.type === "プライベート") {
          return -1;
        }
        if (b.type === "プライベート") {
          return 1;
        }
        return 0;
      }),
    );
  }, [dailyTodoData]);

  // 現在のTodoDataのIDに基づいてTimeTakenデータをフィルタリングする関数
  const filteredTimeTaken = (id: number): TimeTaken[] =>
    timeTakenData.filter((item) => item.todoId === id);

  // カード上のチェックボックスクリック時に、Todoの完了状態を切り替えとデータを更新
  const toggleTodoCompleted = useToggleTodoCompleted();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <List aria-label="ToDoリスト">
        <Stack spacing={1}>
          {sortedTodoData.map((data, index) => {
            const dailyTimeTakenData = filteredTimeTaken(data.id);
            const totalTimeTaken = calculateTotalTimeTaken(
              dailyTimeTakenData,
              data.date,
            );
            return (
              <ListItem key={index} disablePadding>
                <Card
                  variant="outlined"
                  sx={{
                    width: "100%",
                    backgroundColor: "#f9f9f9",
                    borderLeft: `solid 3px ${todoDarkColor(data.type, theme)}`,
                    position: "relative",
                    filter:
                      data.completed === 1
                        ? "contrast(0.8) opacity(0.75) grayscale(0.75)"
                        : "none",
                  }}
                  onClick={(e) => {
                    if ((e.target as Element).tagName === "INPUT") return;
                    onSelectTodoData(data);
                  }}
                >
                  <Checkbox
                    checked={Boolean(Number(data.completed) === 1)}
                    onClick={() => {
                      toggleTodoCompleted(data);
                    }}
                    sx={{
                      padding: 0,
                      position: "absolute",
                      top: "9px",
                      left: "10px",
                      color: todoDarkColor(data.type, theme),
                      "&.Mui-checked": {
                        color: todoDarkColor(data.type, theme),
                      },
                    }}
                  />
                  <CardActionArea>
                    <CardContent sx={{ padding: 1.5 }}>
                      <Stack>
                        <Stack
                          direction={"row"}
                          alignItems="flex-start"
                          justifyContent="space-between"
                        >
                          <Box flexGrow={1}>
                            <Typography
                              variant="body2"
                              lineHeight={1.35}
                              fontWeight={"bold"}
                              sx={{
                                paddingLeft: 3.5,
                              }}
                            >
                              {data.content}
                            </Typography>
                          </Box>
                          {data.time !== "00:00:00" &&
                            data.time !== "00:00" && (
                              <Box flexGrow={0} flexShrink={0} ml={1}>
                                <Typography
                                  variant="caption"
                                  textAlign="right"
                                  fontWeight={700}
                                >
                                  {format(`${data.date} ${data.time}`, "HH:mm")}
                                </Typography>
                              </Box>
                            )}
                        </Stack>

                        {dailyTimeTakenData.length === 0 &&
                        (data.estimated === "00:00:00" ||
                          data.estimated === "00:00") ? (
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
                                  color: todoMainColor(data.type, theme),
                                }}
                              />
                            </Box>
                            <Box flexGrow={1} flexShrink={1}>
                              <Typography
                                lineHeight={1.35}
                                letterSpacing={0.5}
                                variant="caption"
                              >
                                {totalTimeTaken.hours === 0 &&
                                  totalTimeTaken.minutes === 0 &&
                                  "0時間"}
                                {totalTimeTaken.hours !== 0 &&
                                  `${totalTimeTaken.hours}時間`}
                                {totalTimeTaken.minutes !== 0 &&
                                  `${totalTimeTaken.minutes}分`}
                              </Typography>
                            </Box>
                            {data.estimated !== "00:00:00" &&
                              data.estimated !== "00:00" && (
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
                                      `${data.date} ${data.estimated}`,
                                      "H",
                                    ) !== "0" &&
                                      format(
                                        `${data.date} ${data.estimated}`,
                                        "H時間",
                                      )}
                                    {format(
                                      `${data.date} ${data.estimated}`,
                                      "m",
                                    ) !== "0" &&
                                      format(
                                        `${data.date} ${data.estimated}`,
                                        "m分",
                                      )}
                                  </Typography>
                                </Box>
                              )}
                          </Stack>
                        )}

                        {data.projectId !== 0 && (
                          <Stack
                            direction={"row"}
                            alignItems="flex-start"
                            marginTop={0.5}
                          >
                            <Box flexGrow={0} flexShrink={0} marginRight={1}>
                              <FolderSharpIcon
                                fontSize="small"
                                sx={{
                                  verticalAlign: "text-bottom",
                                  color: todoMainColor(data.type, theme),
                                }}
                              />
                            </Box>
                            <Box sx={{ mt: "2px" }}>
                              <Typography
                                lineHeight={1.35}
                                letterSpacing={0.5}
                                variant="caption"
                              >
                                {
                                  projectData.find(
                                    (project) => project.id === data.projectId,
                                  )?.name
                                }
                              </Typography>
                            </Box>
                          </Stack>
                        )}
                        {data.memo !== "" && (
                          <Stack
                            direction={"row"}
                            alignItems="flex-start"
                            marginTop={0.5}
                          >
                            <Box flexGrow={0} flexShrink={0} marginRight={1}>
                              <FeedSharpIcon
                                fontSize="small"
                                sx={{
                                  color: todoMainColor(data.type, theme),
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
                                {data.memo
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
              </ListItem>
            );
          })}
        </Stack>
      </List>
      <Button
        fullWidth
        startIcon={<AddCircleSharpIcon />}
        onClick={() => {
          setSelectedTimeTakenData([]);
          setSelectedTodoData(null);
          toggleForm("todo");
        }}
        sx={{ textTransform: "none", letterSpacing: 0.5 }}
      >
        ToDoを追加
      </Button>
    </Box>
  );
};

export default DailyTodoLists;
