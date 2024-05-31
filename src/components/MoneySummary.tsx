import { Grid, Paper, Stack, Typography } from "@mui/material";
import { CSSProperties } from "@mui/material/styles/createMixins";
import ArrowUpwardSharpIcon from "@mui/icons-material/ArrowUpwardSharp";
import ArrowDownwardSharpIcon from "@mui/icons-material/ArrowDownwardSharp";
import PaymentsSharpIcon from "@mui/icons-material/PaymentsSharp";
import useFilterCurrentMonthData from "../hooks/useFilterCurrentMonthData";
import { financeCalculations } from "../utils/financeCalculations";
import { filterYearData } from "../utils/filterDataFn";
import { formatCurrency } from "../utils/formatting";
import { useMoneyContext } from "../context/MoneyContext";
import { useCommonContext } from "../context/CommonContext";

interface PaperItemProps {
  icon: JSX.Element;
  title: string;
  amount: number;
  yearAmount: number;
}

const PaperItem = ({ icon, title, amount, yearAmount }: PaperItemProps) => {
  const paperStyle: CSSProperties = {
    padding: "1rem",
    borderRadius: "5px",
    backgroundColor: "#00000082",
    color: "#fff",
    position: "relative",
    border: "none",
  };

  const paperStyleBefore: CSSProperties = {
    content: "''",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "transparent",
    borderRadius: "3px",
    width: "calc(100% - 8px)",
    height: "calc(100% - 8px)",
    border: "1px solid #fff",
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        ...paperStyle,
        "&&::before": {
          ...paperStyleBefore,
        },
      }}
    >
      <Stack direction="row" alignItems="center">
        {icon}
        <Typography fontWeight="bold" variant="body2">
          {title}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="flex-end">
        <Typography
          className="font-serif"
          textAlign="right"
          variant="h5"
          fontWeight="700"
        >
          ¥ {formatCurrency(amount)}
        </Typography>
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        flexWrap="wrap"
        sx={{ marginTop: 0.5 }}
      >
        <Typography
          variant="caption"
          sx={{
            p: "0.3rem 1rem",
            border: "1px solid white",
            borderRadius: "999px",
            lineHeight: 1,
            backgroundColor: "rgba(255,255,255,0.2)",
          }}
        >
          年間
        </Typography>
        <Typography
          className="font-serif"
          textAlign="right"
          fontWeight="500"
          ml={1.5}
        >
          ¥ {formatCurrency(yearAmount)}
        </Typography>
      </Stack>
    </Paper>
  );
};

const MoneySummary = () => {
  const { currentMonth } = useCommonContext();
  const { moneyData } = useMoneyContext();
  const monthlyMoneyData = useFilterCurrentMonthData(moneyData);
  const { income, expense, balance } = financeCalculations(monthlyMoneyData);
  const yearMoneyData = filterYearData(moneyData, currentMonth);
  const {
    income: yearIncome,
    expense: yearExpense,
    balance: yearBalance,
  } = financeCalculations(yearMoneyData);

  return (
    <Grid container spacing={{ xs: 1, sm: 2 }}>
      <Grid item xs={12} md={4}>
        <PaperItem
          icon={
            <ArrowUpwardSharpIcon
              sx={{ padding: "0.2rem", marginRight: 0.5, fontSize: "2rem" }}
            />
          }
          title="収入"
          amount={income}
          yearAmount={yearIncome}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <PaperItem
          icon={
            <ArrowDownwardSharpIcon
              sx={{ padding: "0.2rem", marginRight: 0.5, fontSize: "2rem" }}
            />
          }
          title="支出"
          amount={expense}
          yearAmount={yearExpense}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <PaperItem
          icon={
            <PaymentsSharpIcon
              sx={{ padding: "0.2rem", marginRight: 1, fontSize: "2rem" }}
            />
          }
          title="収支"
          amount={balance}
          yearAmount={yearBalance}
        />
      </Grid>
    </Grid>
  );
};

export default MoneySummary;
