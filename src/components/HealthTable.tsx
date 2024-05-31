import * as React from "react";
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
import { Avatar, Chip, CircularProgress } from "@mui/material";
import { grey } from "@mui/material/colors";
import { visuallyHidden } from "@mui/utils";
import { compareDesc, format, parseISO } from "date-fns";
import useFilterCurrentMonthData from "../hooks/useFilterCurrentMonthData";
import { sendRequest } from "../utils/apiRequests";
import { Health } from "../types";
import { useHealthContext } from "../context/HealthContext";
import { useCommonContext } from "../context/CommonContext";

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

function getComparator<Key extends keyof Health>(
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
  id: keyof Health;
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
    id: "upTime",
    numeric: false,
    disablePadding: true,
    label: "起床",
  },
  {
    id: "bedTime",
    numeric: false,
    disablePadding: true,
    label: "就寝",
  },
  {
    id: "body",
    numeric: false,
    disablePadding: true,
    label: "体重",
  },
  {
    id: "headache",
    numeric: false,
    disablePadding: true,
    label: "体調",
  },
  {
    id: "memo",
    numeric: false,
    disablePadding: true,
    label: "メモ",
  },
];

interface HealthTableProps {
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Health,
  ) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function HealthTableHead({
  onSelectAllClick,
  order,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort,
}: HealthTableProps) {
  const createSortHandler =
    (property: keyof Health) => (event: React.MouseEvent<unknown>) => {
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
            sx={{ padding: "16px 8px" }}
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

interface HealthTableToolbarProps {
  numSelected: number;
  setSelected: React.Dispatch<React.SetStateAction<readonly number[]>>;
  selected: readonly number[];
}

function HealthTableToolbar({
  numSelected,
  selected,
  setSelected,
}: HealthTableToolbarProps) {
  const { userId, csrfToken } = useCommonContext();
  const { healthData, setHealthData } = useHealthContext();

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
    urlSearchParams.append("tableType", "health");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      const newHealthData = healthData.filter(
        (data) => !selected.includes(data.id),
      );
      setHealthData(newHealthData);
      setSelected([]);
    }
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
          variant="subtitle1"
          component="div"
          color="#fff"
        >
          {numSelected} 件選択中
        </Typography>
      ) : (
        <Typography
          className="font-serif"
          fontWeight={700}
          sx={{ flex: "1 1 100%" }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          月間データ一覧
        </Typography>
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

interface HealthTableMainProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export default function HealthTable({ page, setPage }: HealthTableMainProps) {
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof Health>("date");
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const { healthData, isHealthLoading } = useHealthContext();
  const monthlyHealthData = useFilterCurrentMonthData(healthData);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Health,
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = monthlyHealthData.map((n) => n.id);
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

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - monthlyHealthData.length)
      : 0;

  const visibleRows = React.useMemo(() => {
    const sortedMonthlyMoneyData = [...monthlyHealthData].sort((a, b) =>
      compareDesc(parseISO(a.date), parseISO(b.date)),
    );
    return stableSort(
      sortedMonthlyMoneyData,
      getComparator(order, orderBy),
    ).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [order, orderBy, page, rowsPerPage, monthlyHealthData]);

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
    <Box sx={{ width: "100%" }} className="contentBox">
      {isHealthLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" p={3}>
          <CircularProgress color="secondary" size={30} />
        </Box>
      ) : (
        <>
          <HealthTableToolbar
            numSelected={selected.length}
            selected={selected}
            setSelected={setSelected}
          />
          <TableContainer>
            <Table
              sx={{ minWidth: 700 }}
              aria-labelledby="tableTitle"
              size="medium"
            >
              <HealthTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={monthlyHealthData.length}
              />
              <TableBody>
                {visibleRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body1" p={2}>
                        データがありません
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {visibleRows.map((row, index) => {
                      const isItemSelected = isSelected(row.id);
                      const labelId = `enhanced-table-checkbox-${index}`;
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
                              width: "10%",
                              minWidth: "75px",
                              padding: "16px 8px",
                            }}
                          >
                            {format(row.upTime, "HH:mm") === "00:00"
                              ? "--"
                              : format(row.upTime, "HH:mm")}
                          </TableCell>
                          <TableCell
                            align="left"
                            sx={{
                              width: "10%",
                              minWidth: "75px",
                              padding: "16px 8px",
                            }}
                          >
                            {format(row.bedTime, "HH:mm") === "00:00"
                              ? "--"
                              : format(row.bedTime, "HH:mm")}
                          </TableCell>
                          <TableCell
                            align="left"
                            sx={{
                              width: "10%",
                              minWidth: "70px",
                              padding: "16px 8px",
                            }}
                          >
                            {Number(row.body) === 0 ? "--" : Number(row.body)}
                          </TableCell>

                          <TableCell
                            align="left"
                            sx={{
                              width: "15%",
                              minWidth: "155px",
                              padding: "16px 8px",
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
                                  avatar={
                                    <Avatar
                                      alt="頭痛"
                                      src="/icon/headache.svg"
                                    />
                                  }
                                  label="頭痛"
                                  sx={commonChipStyle}
                                />
                              )}
                              {row.stomach === 1 && (
                                <Chip
                                  size="small"
                                  avatar={
                                    <Avatar
                                      alt="腹痛・胃痛"
                                      src="/icon/stomach.svg"
                                    />
                                  }
                                  label="腹痛・胃痛"
                                  sx={commonChipStyle}
                                />
                              )}
                              {row.period === 1 && (
                                <Chip
                                  size="small"
                                  avatar={
                                    <Avatar alt="生理" src="/icon/period.svg" />
                                  }
                                  label="生理"
                                  sx={commonChipStyle}
                                />
                              )}
                              {row.cold === 1 && (
                                <Chip
                                  size="small"
                                  avatar={
                                    <Avatar
                                      alt="風邪・発熱"
                                      src="/icon/cold.svg"
                                    />
                                  }
                                  label="風邪・発熱"
                                  sx={commonChipStyle}
                                />
                              )}
                              {row.hayfever === 1 && (
                                <Chip
                                  size="small"
                                  avatar={
                                    <Avatar
                                      alt="花粉症"
                                      src="/icon/hayfever.svg"
                                    />
                                  }
                                  label="花粉症"
                                  sx={commonChipStyle}
                                />
                              )}
                              {row.nausea === 1 && (
                                <Chip
                                  size="small"
                                  avatar={
                                    <Avatar
                                      alt="吐き気"
                                      src="/icon/nausea.svg"
                                    />
                                  }
                                  label="吐き気"
                                  sx={commonChipStyle}
                                />
                              )}
                              {row.sleepless === 1 && (
                                <Chip
                                  size="small"
                                  avatar={
                                    <Avatar
                                      alt="睡眠不足"
                                      src="/icon/sleepless.svg"
                                    />
                                  }
                                  label="睡眠不足"
                                  sx={commonChipStyle}
                                />
                              )}
                              {row.tired === 1 && (
                                <Chip
                                  size="small"
                                  avatar={
                                    <Avatar
                                      alt="疲労感"
                                      src="/icon/tired.svg"
                                    />
                                  }
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
                                    <Avatar
                                      alt="その他の症状"
                                      src="/icon/other.svg"
                                    />
                                  }
                                  label="その他の症状"
                                  sx={commonChipStyle}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="left" sx={{ padding: "16px 8px" }}>
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
                        <TableCell colSpan={7} />
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
            count={monthlyHealthData.length}
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
