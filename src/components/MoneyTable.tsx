import * as React from "react";
import {
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
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
import { visuallyHidden } from "@mui/utils";
import { compareDesc, parseISO } from "date-fns";
import MoneyIcons from "./common/MoneyIcons";
import useFilterCurrentMonthData from "../hooks/useFilterCurrentMonthData";
import { formatCurrency } from "../utils/formatting";
import { sendRequest } from "../utils/apiRequests";
import { ExpenseCategory, IncomeCategory, Money, MoneyType } from "../types";
import { useMoneyContext } from "../context/MoneyContext";
import { useCommonContext } from "../context/CommonContext";

interface Data {
  id: number;
  date: string;
  type: string;
  category: string;
  amount: number;
  content: string;
}

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

function getComparator<Key extends keyof Data>(
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
  id: keyof Data;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: "date",
    numeric: false,
    disablePadding: true,
    label: "日付",
  },
  {
    id: "category",
    numeric: false,
    disablePadding: false,
    label: "カテゴリ",
  },
  {
    id: "amount",
    numeric: false,
    disablePadding: false,
    label: "金額",
  },
  {
    id: "content",
    numeric: false,
    disablePadding: false,
    label: "内容",
  },
];

interface MoneyTableProps {
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Data,
  ) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function MoneyTableHead({
  onSelectAllClick,
  order,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort,
}: MoneyTableProps) {
  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
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
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
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

interface MoneyTableToolbarProps {
  numSelected: number;
  selected: readonly number[];
  setSelected: React.Dispatch<React.SetStateAction<readonly number[]>>;
  selectedType: MoneyType | ExpenseCategory | IncomeCategory | "全て表示";
  setSlectedType: React.Dispatch<
    MoneyType | ExpenseCategory | IncomeCategory | "全て表示"
  >;
}

function MoneyTableToolbar({
  numSelected,
  selected,
  setSelected,
  selectedType,
  setSlectedType,
}: MoneyTableToolbarProps) {
  const { userId, csrfToken } = useCommonContext();
  const { moneyData, setMoneyData } = useMoneyContext();
  // データ削除処理
  const deleteMoneyData = async () => {
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
    urlSearchParams.append("tableType", "money");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      const newMoneyData = moneyData.filter(
        (data) => !selected.includes(data.id),
      );
      setMoneyData(newMoneyData);
      setSelected([]);
    }
  };

  const handleTypeChange = (
    e: SelectChangeEvent<
      MoneyType | ExpenseCategory | IncomeCategory | "全て表示"
    >,
  ) => {
    setSlectedType(
      e.target.value as
        | MoneyType
        | ExpenseCategory
        | IncomeCategory
        | "全て表示",
    );
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
          sx={{ flex: "1 1 100%", color: "#fff" }}
          color="inherit"
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
                <MenuItem value="収入">収入</MenuItem>
                <MenuItem value="支出">支出</MenuItem>
                <MenuItem value="給与">給与</MenuItem>
                <MenuItem value="副収入">副収入</MenuItem>
                <MenuItem value="食費">食費</MenuItem>
                <MenuItem value="日用品">日用品</MenuItem>
                <MenuItem value="住宅費">住宅費</MenuItem>
                <MenuItem value="お菓子">お菓子</MenuItem>
                <MenuItem value="交通費">交通費</MenuItem>
                <MenuItem value="交際費">交際費</MenuItem>
                <MenuItem value="娯楽">娯楽</MenuItem>
                <MenuItem value="美容">美容</MenuItem>
                <MenuItem value="月契約">月契約</MenuItem>
                <MenuItem value="保険">保険</MenuItem>
                <MenuItem value="医療">医療</MenuItem>
                <MenuItem value="その他">その他</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}
      {numSelected > 0 && (
        <Tooltip title="Delete">
          <IconButton onClick={deleteMoneyData}>
            <DeleteIcon sx={{ color: "#fff" }} />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

interface MoneyTableMainProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export default function MoneyTable({ page, setPage }: MoneyTableMainProps) {
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof Data>("date");
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const { moneyData, isMoneyLoading } = useMoneyContext();
  const monthlyMoneyData = useFilterCurrentMonthData(moneyData);

  const [allVisibleRows, setAllVisibleRows] =
    React.useState<Money[]>(monthlyMoneyData);
  const [selectedType, setSlectedType] = React.useState<
    MoneyType | ExpenseCategory | IncomeCategory | "全て表示"
  >("全て表示");

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data,
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
    let sortedMonthlyTodoData = [...monthlyMoneyData].sort((a, b) =>
      compareDesc(parseISO(a.date), parseISO(b.date)),
    );

    if (
      selectedType !== "全て表示" &&
      selectedType !== "収入" &&
      selectedType !== "支出"
    ) {
      sortedMonthlyTodoData = sortedMonthlyTodoData.filter(
        (todo) => todo.category === selectedType,
      );
    }

    if (selectedType === "収入" || selectedType === "支出") {
      sortedMonthlyTodoData = sortedMonthlyTodoData.filter(
        (todo) => todo.type === selectedType,
      );
    }

    setAllVisibleRows(sortedMonthlyTodoData);

    return stableSort(
      sortedMonthlyTodoData,
      getComparator(order, orderBy),
    ).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [order, orderBy, page, rowsPerPage, monthlyMoneyData, selectedType]);

  React.useEffect(() => {
    setPage(0);
  }, [selectedType]);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - allVisibleRows.length)
      : 0;

  return (
    <Box className="contentBox" sx={{ width: "100%" }}>
      {isMoneyLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" p={3}>
          <CircularProgress color="secondary" size={30} />
        </Box>
      ) : (
        <>
          <MoneyTableToolbar
            numSelected={selected.length}
            selected={selected}
            setSelected={setSelected}
            selectedType={selectedType}
            setSlectedType={setSlectedType}
          />
          <TableContainer>
            <Table
              sx={{ minWidth: 600 }}
              aria-labelledby="tableTitle"
              size="medium"
            >
              <MoneyTableHead
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
                    <TableCell colSpan={5} align="center">
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
                              fontWeight: 500,
                              width: "12%",
                              minWidth: "100px",
                            }}
                          >
                            {row.date}
                          </TableCell>
                          <TableCell
                            align="left"
                            sx={{
                              width: "15%",
                              minWidth: "110px",
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
                                  {React.cloneElement(
                                    MoneyIcons[row.category],
                                    {
                                      style: {
                                        color: "#485973",
                                      },
                                    },
                                  )}
                                </>
                              ) : (
                                <>
                                  {React.cloneElement(
                                    MoneyIcons[row.category],
                                    {
                                      style: {
                                        color: "#954545",
                                      },
                                    },
                                  )}
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
                              minWidth: "100px",
                            }}
                          >
                            ¥ {formatCurrency(Number(row.amount))}
                          </TableCell>
                          <TableCell align="left">{row.content}</TableCell>
                        </TableRow>
                      );
                    })}
                    {emptyRows > 0 && (
                      <TableRow
                        style={{
                          height: 53 * emptyRows,
                        }}
                      >
                        <TableCell colSpan={5} />
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
