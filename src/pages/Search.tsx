import React, { useEffect } from "react";
import {
  Avatar,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import SearchSharpIcon from "@mui/icons-material/SearchSharp";
import PaymentsSharpIcon from "@mui/icons-material/PaymentsSharp";
import AccessibilityNewSharpIcon from "@mui/icons-material/AccessibilityNewSharp";
import CheckSharpIcon from "@mui/icons-material/CheckSharp";
import FormatListBulletedSharpIcon from "@mui/icons-material/FormatListBulletedSharp";
import FolderSharpIcon from "@mui/icons-material/FolderSharp";
import FeedSharpIcon from "@mui/icons-material/FeedSharp";
import { grey } from "@mui/material/colors";
import { format } from "date-fns";
import { formatCurrency } from "../utils/formatting";
import { calculateTotalTimeTaken } from "../utils/timeTakenCalculations";
import { TodoTypeIcons } from "../components/common/TodoIcons";
import MoneyIcons from "../components/common/MoneyIcons";
import { Health, Money, MonthlyMemo, Project, TimeTaken, Todo } from "../types";
import { useMoneyContext } from "../context/MoneyContext";
import { useProjectContext } from "../context/ProjectContext";
import { useHealthContext } from "../context/HealthContext";
import { useTodoContext } from "../context/TodoContext";
import { sortDataByDate } from "../utils/sortDataFn";
import { filterDataBySearchWords } from "../utils/filterDataFn";

const MonthlyMemoSearch = ({
  searchResult,
}: {
  searchResult: MonthlyMemo[];
}) => (
  <TableContainer className="contentBox">
    <Box padding={2} display="flex" alignItems="center">
      <FeedSharpIcon sx={{ mr: 1, color: grey[500] }} />
      <Typography
        className="font-serif"
        fontWeight={700}
        variant="h6"
        component="span"
        mr={3}
        lineHeight={1}
      >
        MonthlyMemo
      </Typography>
      <Typography variant="body1" component="span">
        {searchResult.length} 件
      </Typography>
    </Box>

    <Table sx={{ minWidth: 700 }}>
      <TableHead>
        <TableRow>
          <TableCell
            sx={{
              padding: "10px 10px 10px 1rem",
            }}
          >
            日付
          </TableCell>
          <TableCell
            sx={{
              padding: "10px 1rem 10px 10px",
            }}
          >
            メモ
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {searchResult.map((row, index) => (
          <TableRow
            key={index}
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell
              component="th"
              scope="row"
              sx={{
                padding: "1rem 0.5rem 1rem 1rem",
                width: "10%",
                minWidth: "100px",
                fontWeight: 500,
              }}
            >
              {format(row.date, "yyyy-MM")}
            </TableCell>
            <TableCell
              align="left"
              sx={{
                padding: "1rem 1rem 1rem 0.5rem",
              }}
            >
              {row.memo.split("\n").map((line, memoIndex) => (
                <React.Fragment key={memoIndex}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const TodoSearch = ({ searchResult }: { searchResult: Todo[] }) => {
  const theme = useTheme();
  const { timeTakenData } = useTodoContext();
  const { projectData } = useProjectContext();
  // 現在のTodoDataのIDに基づいてTimeTakenデータをフィルタリングする関数
  const filteredTimeTaken = (id: number): TimeTaken[] =>
    timeTakenData.filter((item) => item.todoId === id);

  return (
    <TableContainer className="contentBox">
      <Box padding={2} display="flex" alignItems="center">
        <FormatListBulletedSharpIcon sx={{ mr: 1, color: grey[500] }} />
        <Typography
          className="font-serif"
          fontWeight={700}
          variant="h6"
          component="span"
          mr={3}
          lineHeight={1}
        >
          ToDo
        </Typography>
        <Typography variant="body1" component="span">
          {searchResult.length} 件
        </Typography>
      </Box>

      <Table sx={{ minWidth: 700 }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                padding: "10px 10px 10px 1rem",
              }}
            >
              日付
            </TableCell>
            <TableCell align="center">時間</TableCell>
            <TableCell align="center">プロジェクト</TableCell>
            <TableCell align="center">内容</TableCell>
            <TableCell align="center">完了</TableCell>
            <TableCell align="center">作業時間</TableCell>
            <TableCell
              sx={{
                padding: "10px 1rem 10px 10px",
              }}
            >
              メモ
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {searchResult.map((row, index) => {
            const timeTakens = filteredTimeTaken(row.id);
            const totalTimeTaken = calculateTotalTimeTaken(
              timeTakens,
              row.date,
            );
            const project = projectData.find(
              (item) => item.id === row.projectId,
            );

            return (
              <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    padding: "1rem 0.5rem 1rem 1rem",
                    width: "8%",
                    minWidth: "100px",
                    fontWeight: 500,
                  }}
                >
                  {row.date}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    width: "9%",
                    minWidth: "70px",
                    padding: "1rem 0.5rem",
                  }}
                >
                  {format(`${row.date} ${row.time}`, "HH:mm") !== "00:00" &&
                    format(`${row.date} ${row.time}`, "HH:mm")}
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    width: "13%",
                    minWidth: "105px",
                    padding: "1rem 0.5rem",
                  }}
                >
                  {project && project.name}
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    width: "18%",
                    minWidth: "140px",
                    padding: "1rem 0.5rem",
                  }}
                >
                  <Box
                    component={"div"}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "nowrap",
                    }}
                  >
                    {row.type === "プライベート" &&
                      React.cloneElement(TodoTypeIcons[row.type], {
                        style: {
                          color: theme.palette.incomeColor.dark,
                        },
                      })}
                    {row.type === "仕事" &&
                      React.cloneElement(TodoTypeIcons[row.type], {
                        style: {
                          color: theme.palette.expenseColor.dark,
                        },
                      })}
                    {row.type === "ルーティン" &&
                      React.cloneElement(TodoTypeIcons[row.type], {
                        style: {
                          color: theme.palette.balanceColor.dark,
                        },
                      })}
                    <Typography variant="body2" ml={1}>
                      {row.content}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    width: "6%",
                    minWidth: "50px",
                    padding: "1rem 0.5rem",
                  }}
                >
                  {row.completed === 1 && (
                    <CheckSharpIcon
                      fontSize="small"
                      sx={{
                        color: grey[500],
                      }}
                    />
                  )}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    width: "12%",
                    minWidth: "100px",
                    padding: "1rem 0.5rem",
                  }}
                >
                  {timeTakens.length > 0 &&
                    totalTimeTaken.hours === 0 &&
                    totalTimeTaken.minutes === 0 &&
                    "0時間"}
                  {totalTimeTaken.hours !== 0 && `${totalTimeTaken.hours}時間`}
                  {totalTimeTaken.minutes !== 0 &&
                    `${totalTimeTaken.minutes}分`}
                  {row.estimated !== "00:00" &&
                    row.estimated !== "00:00:00" && (
                      <Typography
                        component={"span"}
                        variant="caption"
                        sx={{
                          display: "block",
                          fontSize: "0.7rem",
                        }}
                      >
                        （
                        {format(`${row.date} ${row.estimated}`, "H") !== "0" &&
                          format(`${row.date} ${row.estimated}`, "H時間")}
                        {format(`${row.date} ${row.estimated}`, "m") !== "0" &&
                          format(`${row.date} ${row.estimated}`, "m分")}
                        ）
                      </Typography>
                    )}
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    padding: "1rem 1rem 1rem 0.5rem",
                  }}
                >
                  {row.memo.split("\n").map((line, memoIndex) => (
                    <React.Fragment key={memoIndex}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const ProjectSearch = ({ searchResult }: { searchResult: Project[] }) => {
  const { sectionData } = useProjectContext();

  return (
    <TableContainer className="contentBox">
      <Box padding={2} display="flex" alignItems="center">
        <FolderSharpIcon sx={{ mr: 1, color: grey[500] }} />
        <Typography
          className="font-serif"
          fontWeight={700}
          variant="h6"
          component="span"
          mr={3}
          lineHeight={1}
        >
          Project
        </Typography>
        <Typography variant="body1" component="span">
          {searchResult.length} 件
        </Typography>
      </Box>

      <Table sx={{ minWidth: 700 }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                padding: "10px 10px 10px 1rem",
              }}
            >
              プロジェクト
            </TableCell>
            <TableCell align="center">終了日</TableCell>
            <TableCell align="center">完了</TableCell>
            <TableCell align="center">セクション</TableCell>
            <TableCell
              sx={{
                padding: "10px 1rem 10px 10px",
              }}
            >
              メモ
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {searchResult.map((row, index) => {
            const section = sectionData.filter(
              (item) => item.projectId === row.id,
            );
            return (
              <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    padding: "1rem 0.5rem 1rem 1rem",
                    width: "16%",
                    minWidth: "150px",
                    fontWeight: 500,
                  }}
                >
                  {row.name}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    width: "10%",
                    minWidth: "100px",
                    padding: "1rem 0.5rem",
                  }}
                >
                  {row.end}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    width: "6%",
                    minWidth: "50px",
                    padding: "1rem 0.5rem",
                  }}
                >
                  {row.completed === 1 && (
                    <CheckSharpIcon
                      fontSize="small"
                      sx={{
                        color: grey[500],
                      }}
                    />
                  )}
                </TableCell>
                <TableCell
                  sx={{
                    width: "16%",
                    minWidth: "120px",
                    padding: "1rem 0.5rem",
                  }}
                >
                  <ul className="table-ul">
                    {section.map((item, sectionIndex) => (
                      <li key={sectionIndex}>{item.name}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    padding: "1rem 1rem 1rem 0.5rem",
                  }}
                >
                  {row.memo.split("\n").map((line, memoIndex) => (
                    <React.Fragment key={memoIndex}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const MoneySearch = ({ searchResult }: { searchResult: Money[] }) => {
  const theme = useTheme();

  return (
    <TableContainer className="contentBox">
      <Box padding={2} display="flex" alignItems="center">
        <PaymentsSharpIcon sx={{ mr: 1, color: grey[500] }} />
        <Typography
          className="font-serif"
          fontWeight={700}
          variant="h6"
          component="span"
          mr={3}
          lineHeight={1}
        >
          Money
        </Typography>
        <Typography variant="body1" component="span">
          {searchResult.length} 件
        </Typography>
      </Box>
      <Table sx={{ minWidth: 700 }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                padding: "10px 10px 10px 1rem",
              }}
            >
              日付
            </TableCell>
            <TableCell>カテゴリ</TableCell>
            <TableCell>金額</TableCell>
            <TableCell
              sx={{
                padding: "10px 1rem 10px 10px",
              }}
            >
              内容
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {searchResult.map((row, index) => (
            <TableRow
              key={index}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell
                component="th"
                scope="row"
                sx={{
                  fontWeight: 500,
                  width: "16%",
                  minWidth: "120px",
                  padding: "1rem 0.5rem 1rem 1rem",
                }}
              >
                {row.date}
              </TableCell>
              <TableCell
                sx={{
                  width: "17%",
                  minWidth: "120px",
                  padding: "1rem 0.5rem",
                }}
              >
                <Box
                  component={"div"}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "nowrap",
                  }}
                >
                  {row.type === "収入" ? (
                    <>
                      {React.cloneElement(MoneyIcons[row.category], {
                        style: {
                          color: theme.palette.incomeColor.dark,
                        },
                      })}
                    </>
                  ) : (
                    <>
                      {React.cloneElement(MoneyIcons[row.category], {
                        style: {
                          color: theme.palette.expenseColor.dark,
                        },
                      })}
                    </>
                  )}
                  <Typography variant="body2" ml={1}>
                    {row.category}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  width: "15%",
                  minWidth: "110px",
                  padding: "1rem 0.5rem",
                }}
              >
                ¥ {formatCurrency(Number(row.amount))}
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  padding: "1rem 1rem 1rem 0.5rem",
                }}
              >
                {row.content}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const HealthSearch = ({ searchResult }: { searchResult: Health[] }) => {
  const commonChipStyle = {
    marginTop: 0.5,
    marginBottom: 0.5,
    marginLeft: 0,
    marginRight: 1,
    backgroundColor: "transparent",
    color: grey[600],
    border: "solid 1px #eee",
  };

  return (
    <TableContainer className="contentBox">
      <Box padding={2} display="flex" alignItems="center">
        <AccessibilityNewSharpIcon sx={{ mr: 1, color: grey[500] }} />
        <Typography
          className="font-serif"
          fontWeight={700}
          variant="h6"
          component="span"
          mr={3}
          lineHeight={1}
        >
          Health
        </Typography>
        <Typography variant="body1" component="span">
          {searchResult.length} 件
        </Typography>
      </Box>
      <Table sx={{ minWidth: 700 }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                padding: "10px 10px 10px 1rem",
              }}
            >
              日付
            </TableCell>
            <TableCell align="center">起床</TableCell>
            <TableCell align="center">就寝</TableCell>
            <TableCell align="center">体重</TableCell>
            <TableCell align="center">体調</TableCell>
            <TableCell
              sx={{
                padding: "10px 1rem 10px 10px",
              }}
            >
              メモ
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {searchResult.map((row, index) => (
            <TableRow
              key={index}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell
                component="th"
                scope="row"
                sx={{
                  fontWeight: 500,
                  padding: "1rem 0.5rem 1rem 1rem",
                  width: "9%",
                  minWidth: "100px",
                }}
              >
                {row.date}
              </TableCell>
              <TableCell
                sx={{
                  width: "11%",
                  minWidth: "75px",
                  padding: "1rem 0.5rem",
                  textAlign: "center",
                }}
              >
                {format(row.upTime, "HH:mm") === "00:00"
                  ? "--"
                  : format(row.upTime, "HH:mm")}
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  width: "11%",
                  minWidth: "75px",
                  padding: "1rem 0.5rem",
                  textAlign: "center",
                }}
              >
                {format(row.bedTime, "HH:mm") === "00:00"
                  ? "--"
                  : format(row.bedTime, "HH:mm")}
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  width: "11%",
                  minWidth: "75px",
                  padding: "1rem 0.5rem",
                  textAlign: "center",
                }}
              >
                {Number(row.body) === 0 ? "--" : Number(row.body)}
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  width: "15%",
                  minWidth: "120px",
                  padding: "1rem 0.5rem",
                }}
              >
                <Box
                  component={"div"}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {row.headache === 1 && (
                    <Chip
                      size="small"
                      avatar={<Avatar alt="頭痛" src="/icon/headache.svg" />}
                      label="頭痛"
                      sx={commonChipStyle}
                    />
                  )}
                  {row.stomach === 1 && (
                    <Chip
                      size="small"
                      avatar={
                        <Avatar alt="腹痛・胃痛" src="/icon/stomach.svg" />
                      }
                      label="腹痛・胃痛"
                      sx={commonChipStyle}
                    />
                  )}
                  {row.period === 1 && (
                    <Chip
                      size="small"
                      avatar={<Avatar alt="生理" src="/icon/period.svg" />}
                      label="生理"
                      sx={commonChipStyle}
                    />
                  )}
                  {row.cold === 1 && (
                    <Chip
                      size="small"
                      avatar={<Avatar alt="風邪・発熱" src="/icon/cold.svg" />}
                      label="風邪・発熱"
                      sx={commonChipStyle}
                    />
                  )}
                  {row.hayfever === 1 && (
                    <Chip
                      size="small"
                      avatar={<Avatar alt="花粉症" src="/icon/hayfever.svg" />}
                      label="花粉症"
                      sx={commonChipStyle}
                    />
                  )}
                  {row.nausea === 1 && (
                    <Chip
                      size="small"
                      avatar={<Avatar alt="吐き気" src="/icon/nausea.svg" />}
                      label="吐き気"
                      sx={commonChipStyle}
                    />
                  )}
                  {row.sleepless === 1 && (
                    <Chip
                      size="small"
                      avatar={
                        <Avatar alt="睡眠不足" src="/icon/sleepless.svg" />
                      }
                      label="睡眠不足"
                      sx={commonChipStyle}
                    />
                  )}
                  {row.tired === 1 && (
                    <Chip
                      size="small"
                      avatar={<Avatar alt="疲労感" src="/icon/tired.svg" />}
                      label="疲労感"
                      sx={commonChipStyle}
                    />
                  )}
                  {row.depression === 1 && (
                    <Chip
                      size="small"
                      avatar={
                        <Avatar
                          alt="気分の落ち込み"
                          src="/icon/depression.svg"
                        />
                      }
                      label="気分の落ち込み"
                      sx={commonChipStyle}
                    />
                  )}
                  {row.other === 1 && (
                    <Chip
                      size="small"
                      avatar={
                        <Avatar alt="その他の症状" src="/icon/other.svg" />
                      }
                      label="その他の症状"
                      sx={commonChipStyle}
                    />
                  )}
                </Box>
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  padding: "1rem 1rem 1rem 0.5rem",
                }}
              >
                {row.memo.split("\n").map((line, memoIndex) => (
                  <React.Fragment key={memoIndex}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const Search = () => {
  const [searchState, setSearchState] = React.useState(false);
  const [searchWord, setSearchWord] = React.useState(""); // 検索結果の表示用
  const [searchType, setSearchType] = React.useState<"and" | "or">("and");
  const [searchMonthlyMemoResult, setSearchMonthlyMemoResult] = React.useState<
    MonthlyMemo[]
  >([]);
  const [searchTodoResult, setSearchTodoResult] = React.useState<Todo[]>([]);
  const [searchProjectResult, setSearchProjectResult] = React.useState<
    Project[]
  >([]);
  const [searchMoneyResult, setSearchMoneyResult] = React.useState<Money[]>([]);
  const [searchHealthResult, setSearchHealthResult] = React.useState<Health[]>(
    [],
  );
  const { todoData, monthlyMemoData } = useTodoContext();
  const { projectData, sectionData } = useProjectContext();
  const { moneyData } = useMoneyContext();
  const { healthData } = useHealthContext();

  const handleSearch = () => {
    // 検索ワードをスペースで分割して配列にする
    const searchWords = searchWord.split(/\s+/);

    const symptoms: { [key: string]: string } = {
      headache: "頭痛",
      cold: "風邪 発熱 風邪・発熱",
      hayfever: "花粉症",
      stomach: "胃痛 腹痛 腹痛・胃痛",
      depression: "落ち込み 気分の落ち込み 憂鬱",
      nausea: "吐き気 酔い",
      period: "生理",
      sleepless: "睡眠不足 寝不足 眠気",
      tired: "疲労感 疲れ 疲労",
      other: "その他 その他の症状",
    };

    let searchMonthlyMemoData = [];
    let searchTodoData = [];
    let searchProjectData = [];
    let searchMoneyData = [];
    let searchHealthData = [];

    // todoData
    const combinedTodoData = todoData.map((data) => {
      const projectName =
        projectData.find((project) => project.id === data.projectId)?.name ||
        "";
      return {
        ...data,
        combinedContent: `${data.content} ${data.memo} ${projectName}`, // 検索対象の文字列を結合
      };
    });

    // projectData
    const combinedProjectData = projectData.map((data) => {
      const sectionNames = sectionData
        .filter((section) => section.projectId === data.id)
        .map((section) => section.name)
        .join(" "); // 複数のセクション名をスペースで区切って結合
      return {
        ...data,
        combinedContent: `${data.name} ${data.memo} ${sectionNames}`, // 検索対象の文字列を結合
      };
    });

    // healthData
    const combinedHealthData = healthData.map((data) => {
      // 症状に該当する文字列を収集
      const symptomStrings = Object.keys(symptoms)
        .filter((symptom) => data[symptom as keyof Health] === 1)
        .map((symptom) => symptoms[symptom])
        .join(" ");
      return {
        ...data,
        combinedContent: `${data.memo} ${symptomStrings}`, // memoと症状の文字列を結合
      };
    });

    if (searchType === "and") {
      searchMonthlyMemoData = filterDataBySearchWords(
        monthlyMemoData,
        searchWords,
        "memo",
        true,
      );

      searchTodoData = filterDataBySearchWords(
        combinedTodoData,
        searchWords,
        "combinedContent",
        true,
      );

      searchProjectData = filterDataBySearchWords(
        combinedProjectData,
        searchWords,
        "combinedContent",
        true,
      );

      searchMoneyData = filterDataBySearchWords(
        moneyData,
        searchWords,
        "content",
        true,
      );

      searchHealthData = filterDataBySearchWords(
        combinedHealthData,
        searchWords,
        "combinedContent",
        true,
      );
    } else {
      // or検索の場合、少なくとも1つの検索ワードが内容またはメモに含まれるデータをフィルタリング
      searchMonthlyMemoData = filterDataBySearchWords(
        monthlyMemoData,
        searchWords,
        "memo",
      );

      searchTodoData = filterDataBySearchWords(
        combinedTodoData,
        searchWords,
        "combinedContent",
      );

      searchProjectData = filterDataBySearchWords(
        combinedProjectData,
        searchWords,
        "combinedContent",
      );

      searchMoneyData = filterDataBySearchWords(
        moneyData,
        searchWords,
        "content",
      );

      searchHealthData = filterDataBySearchWords(
        combinedHealthData,
        searchWords,
        "combinedContent",
      );
    }

    const sortedSearchMonthlyMemoData = sortDataByDate(
      searchMonthlyMemoData,
      "date",
    );
    const sortedSearchTodoData = sortDataByDate(searchTodoData, "date");
    const sortedSearchProjectData = sortDataByDate(searchProjectData, "end");
    const sortedSearchMoneyData = sortDataByDate(searchMoneyData, "date");
    const sortedSearchHealthData = sortDataByDate(searchHealthData, "date");

    setSearchState(true);
    setSearchMonthlyMemoResult(sortedSearchMonthlyMemoData);
    setSearchTodoResult(sortedSearchTodoData);
    setSearchProjectResult(sortedSearchProjectData);
    setSearchMoneyResult(sortedSearchMoneyData);
    setSearchHealthResult(sortedSearchHealthData);
  };

  useEffect(() => {
    const trimSearchWord = searchWord.trim();
    if (trimSearchWord === "") {
      setSearchState(false);
      setSearchTodoResult([]);
      setSearchProjectResult([]);
      setSearchMoneyResult([]);
      setSearchHealthResult([]);
    } else {
      handleSearch();
    }
  }, [searchWord, searchType]);

  return (
    <Grid
      container
      spacing={3}
      sx={{
        p: "2rem min(4vw, 1.5rem)",
        mt: 0,
      }}
    >
      <Grid item xs={12} sx={{ mt: { xs: 3, lg: 0 } }}>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={0}
        >
          <TextField
            id="input-with-icon-textfield"
            placeholder="検索"
            autoComplete="off"
            fullWidth
            onChange={(e) => {
              setSearchWord(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchSharpIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: "300px",
            }}
          />
        </Stack>
        <Box textAlign="center" mt={1}>
          <FormControl>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as "and" | "or")}
            >
              <FormControlLabel value="and" control={<Radio />} label="AND" />
              <FormControlLabel value="or" control={<Radio />} label="OR" />
            </RadioGroup>
          </FormControl>
        </Box>
      </Grid>
      <Grid item xs={12}>
        {searchState && (
          <Typography variant="body1" fontWeight="bold" align="center">
            検索ワード：{searchWord}
          </Typography>
        )}
      </Grid>
      {searchState &&
        searchMonthlyMemoResult.length === 0 &&
        searchTodoResult.length === 0 &&
        searchProjectResult.length === 0 &&
        searchMoneyResult.length === 0 &&
        searchHealthResult.length === 0 && (
          <Grid item xs={12} mt={4}>
            <Typography variant="body1" align="center">
              該当するデータがありません
            </Typography>
          </Grid>
        )}
      {searchMonthlyMemoResult.length !== 0 && (
        <Grid item xs={12}>
          <MonthlyMemoSearch searchResult={searchMonthlyMemoResult} />
        </Grid>
      )}
      {searchTodoResult.length !== 0 && (
        <Grid item xs={12}>
          <TodoSearch searchResult={searchTodoResult} />
        </Grid>
      )}
      {searchProjectResult.length !== 0 && (
        <Grid item xs={12}>
          <ProjectSearch searchResult={searchProjectResult} />
        </Grid>
      )}
      {searchMoneyResult.length !== 0 && (
        <Grid item xs={12}>
          <MoneySearch searchResult={searchMoneyResult} />
        </Grid>
      )}
      {searchHealthResult.length !== 0 && (
        <Grid item xs={12}>
          <HealthSearch searchResult={searchHealthResult} />
        </Grid>
      )}
    </Grid>
  );
};

export default Search;
