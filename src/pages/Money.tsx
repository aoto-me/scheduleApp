import React, { useState } from "react";
import { Grid, Paper } from "@mui/material";
import MonthSlecter from "../components/MonthSlecter";
import MoneyCategoryChart from "../components/MoneyCategoryChart";
import MoneyBarChart from "../components/MoneyBarChart";
import MoneyTable from "../components/MoneyTable";
import MoneySummary from "../components/MoneySummary";

const Money = () => {
  const [page, setPage] = useState(0);

  const commonPaperStyle = {
    height: "400px",
    display: "flex",
    flexDirection: "column",
    p: 2,
    borderRadius: "5px",
    overflow: "auto",
    border: "solid 1px #ccc",
  };

  return (
    <Grid
      container
      spacing={2}
      sx={{
        p: "2rem min(4vw, 1.5rem)",
        mt: 0,
      }}
    >
      <Grid item xs={12}>
        <MonthSlecter setPage={setPage} />
      </Grid>
      <Grid item xs={12}>
        <MoneySummary />
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={commonPaperStyle} variant="outlined">
          <MoneyCategoryChart />
        </Paper>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper sx={commonPaperStyle} variant="outlined">
          <MoneyBarChart />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <MoneyTable page={page} setPage={setPage} />
      </Grid>
    </Grid>
  );
};

export default Money;
