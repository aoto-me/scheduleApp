import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckSharpIcon from "@mui/icons-material/CheckSharp";
import { grey } from "@mui/material/colors";
import {
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { compareDesc, format, parseISO } from "date-fns";
import useFilterCurrentMonthData from "../hooks/useFilterCurrentMonthData";
import { sendRequest } from "../utils/apiRequests";
import { calculateTotalTimeTaken } from "../utils/timeTakenCalculations";
import { TodoTypeIcons } from "./common/TodoIcons";
import { TimeTaken, Todo, TodoType } from "../types";
import { useTodoContext } from "../context/TodoContext";
import { useCommonContext } from "../context/CommonContext";
import { useProjectContext } from "../context/ProjectContext";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";

function getComparator<Key extends keyof (Todo & TimeTaken)>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number,
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof (Todo & TimeTaken);
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: "date",
    numeric: true,
    disablePadding: true,
    label: "日付",
  },
  {
    id: "time",
    numeric: false,
    disablePadding: false,
    label: "時間",
  },
  {
    id: "projectId",
    numeric: false,
    disablePadding: false,
    label: "プロジェクト",
  },
  {
    id: "content",
    numeric: false,
    disablePadding: false,
    label: "内容",
  },
  {
    id: "completed",
    numeric: false,
    disablePadding: false,
    label: "完了",
  },
  {
    id: "start",
    numeric: false,
    disablePadding: false,
    label: "作業時間",
  },
  {
    id: "memo",
    numeric: true,
    disablePadding: false,
    label: "メモ",
  },
];

interface TodoTableProps {
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof (Todo & TimeTaken),
  ) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function TodoTableHead({
  onSelectAllClick,
  order,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort,
}: TodoTableProps) {
  const createSortHandler =
    (property: keyof (Todo & TimeTaken)) =>
    (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              "aria-label": "すべてのデータを選択する",
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "left" : "center"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={headCell.numeric ? {} : { padding: "1rem 0px 1rem 1rem" }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface TOdoTableToolbarProps {
  numSelected: number;
  selected: readonly number[];
  setSelected: React.Dispatch<React.SetStateAction<readonly number[]>>;
  selectedType: TodoType | "全て表示";
  setSlectedType: React.Dispatch<TodoType | "全て表示">;
}

function TodoTableToolbar({
  numSelected,
  selected,
  setSelected,
  selectedType,
  setSlectedType,
}: TOdoTableToolbarProps) {
  const { userId, csrfToken } = useCommonContext();
  const { todoData, setTodoData, timeTakenData, setTimeTakenData } =
    useTodoContext();

  // データ削除処理
  const deleteTodoData = async () => {
    if (selected.length === 0) {
      return;
    }
    const apiUrl = process.env.REACT_APP_DEL_API;
    const urlSearchParams = new URLSearchParams();
    selected.forEach((id, index) => {
      urlSearchParams.append(`id[${index}]`, id.toString() || "");
    });
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    urlSearchParams.append("tableType", "todo");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      const newTodoData = todoData.filter(
        (data) => !selected.includes(data.id),
      );
      const newTimeTaken = timeTakenData.filter(
        (data) => !selected.includes(data.todoId),
      );
      setTodoData(newTodoData);
      setTimeTakenData(newTimeTaken);
      setSelected([]);
    }
  };

  const handleTypeChange = (e: SelectChangeEvent<TodoType | "全て表示">) => {
    setSlectedType(e.target.value as TodoType | "全て表示");
  };

  return (
    <Toolbar
      sx={{
        padding: "14px 16px !important",
        borderRadius: "5px 5px 0 0",
        ...(numSelected > 0 && {
          background: (theme) => theme.palette.secondary.main,
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="#fff"
          variant="subtitle1"
          component="div"
        >
          {numSelected} 件選択中
        </Typography>
      ) : (
        <Box display="flex" alignItems="center" flexWrap="wrap">
          <Typography
            className="font-serif"
            fontWeight={700}
            variant="h6"
            id="tableTitle"
            component="h2"
            sx={{ margin: "6px 24px 6px 0" }}
          >
            月間データ一覧
          </Typography>
          <Box>
            <FormControl sx={{ width: "150px" }}>
              <Select
                inputProps={{ "aria-label": "表示するToDoタイプ" }}
                value={selectedType}
                onChange={handleTypeChange}
                color="primary"
                sx={{
                  fontSize: "0.875rem",
                  "> .MuiSelect-select": {
                    p: "8px",
                  },
                }}
              >
                <MenuItem value="全て表示">全て表示</MenuItem>
                <MenuItem value="仕事">仕事</MenuItem>
                <MenuItem value="プライベート">プライベート</MenuItem>
                <MenuItem value="ルーティン">ルーティン</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}
      {numSelected > 0 && (
        <Tooltip title="Delete">
          <IconButton onClick={deleteTodoData}>
            <DeleteIcon sx={{ color: "#fff" }} />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

interface TodoTableMainProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export default function TodoTable({ page, setPage }: TodoTableMainProps) {
  const theme = useTheme();
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] =
    React.useState<keyof (Todo & TimeTaken)>("date");
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const { todoData, timeTakenData, isTimeTakenLoading, isTodoLoading } =
    useTodoContext();
  const { projectData } = useProjectContext();
  const monthlyTodoData = useFilterCurrentMonthData(todoData);
  const [allVisibleRows, setAllVisibleRows] =
    React.useState<Todo[]>(monthlyTodoData);
  const [selectedType, setSlectedType] = React.useState<TodoType | "全て表示">(
    "全て表示",
  );

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof (Todo & TimeTaken),
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = allVisibleRows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  const visibleRows = React.useMemo(() => {
    let sortedMonthlyTodoData = [...monthlyTodoData].sort((a, b) =>
      compareDesc(parseISO(a.date), parseISO(b.date)),
    );

    if (selectedType !== "全て表示") {
      sortedMonthlyTodoData = sortedMonthlyTodoData.filter(
        (todo) => todo.type === selectedType,
      );
    }

    setAllVisibleRows(sortedMonthlyTodoData);

    return stableSort(
      sortedMonthlyTodoData as (Todo & TimeTaken)[],
      getComparator(order, orderBy),
    ).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [order, orderBy, page, rowsPerPage, monthlyTodoData, selectedType]);

  React.useEffect(() => {
    setPage(0);
  }, [selectedType]);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - allVisibleRows.length)
      : 0;

  // 現在のTodoDataのIDに基づいてTimeTakenデータをフィルタリングする関数
  const filteredTimeTaken = (id: number): TimeTaken[] =>
    timeTakenData.filter((item) => item.todoId === id);

  return (
    <Box className="contentBox">
      {isTimeTakenLoading && isTodoLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" p={3}>
          <CircularProgress color="secondary" size={30} />
        </Box>
      ) : (
        <>
          <TodoTableToolbar
            numSelected={selected.length}
            selected={selected}
            setSelected={setSelected}
            selectedType={selectedType}
            setSlectedType={setSlectedType}
          />
          <TableContainer>
            <Table
              sx={{ minWidth: 800 }}
              aria-labelledby="tableTitle"
              size="medium"
            >
              <TodoTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={allVisibleRows.length}
              />
              <TableBody>
                {visibleRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body1" p={2}>
                        データがありません
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {visibleRows.map((row, index) => {
                      const isItemSelected = isSelected(row.id);
                      const labelId = `table-checkbox-${index}`;
                      const timeData = filteredTimeTaken(row.id);
                      const totalTimeTaken = calculateTotalTimeTaken(
                        timeData,
                        row.date,
                      );
                      const project = projectData.find(
                        (item) => item.id === row.projectId,
                      );
                      return (
                        <TableRow
                          hover
                          onClick={(event) => handleClick(event, row.id)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={row.id}
                          selected={isItemSelected}
                          sx={{ cursor: "pointer" }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              inputProps={{
                                "aria-labelledby": labelId,
                              }}
                            />
                          </TableCell>
                          <TableCell
                            component="th"
                            id={labelId}
                            scope="row"
                            padding="none"
                            sx={{
                              width: "5%",
                              minWidth: "100px",
                              fontWeight: 500,
                            }}
                          >
                            {row.date}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              width: "6%",
                              minWidth: "70px",
                            }}
                          >
                            {format(`${row.date} ${row.time}`, "HH:mm") !==
                            "00:00"
                              ? format(`${row.date} ${row.time}`, "HH:mm")
                              : "--"}
                          </TableCell>
                          <TableCell
                            align="left"
                            sx={{
                              width: "12%",
                              minWidth: "130px",
                            }}
                          >
                            {project && project.name}
                          </TableCell>
                          <TableCell
                            align="left"
                            sx={{
                              width: "18%",
                              minWidth: "150px",
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
                              width: "4%",
                              minWidth: "70px",
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
                              minWidth: "105px",
                            }}
                          >
                            {timeData.length > 0 &&
                              totalTimeTaken.hours === 0 &&
                              totalTimeTaken.minutes === 0 &&
                              "0時間"}
                            {totalTimeTaken.hours !== 0 &&
                              `${totalTimeTaken.hours}時間`}
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
                                  {format(
                                    `${row.date} ${row.estimated}`,
                                    "H",
                                  ) !== "0" &&
                                    format(
                                      `${row.date} ${row.estimated}`,
                                      "H時間",
                                    )}
                                  {format(
                                    `${row.date} ${row.estimated}`,
                                    "m",
                                  ) !== "0" &&
                                    format(
                                      `${row.date} ${row.estimated}`,
                                      "m分",
                                    )}
                                  ）
                                </Typography>
                              )}
                          </TableCell>
                          <TableCell align="left">
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
                    {emptyRows > 0 && (
                      <TableRow
                        style={{
                          height: 53 * emptyRows,
                        }}
                      >
                        <TableCell colSpan={8} />
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 15, 20]}
            component="div"
            count={allVisibleRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Box>
  );
}
