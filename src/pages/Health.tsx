import React, { useState } from "react";
import { Grid, Paper } from "@mui/material";
import MonthSlecter from "../components/MonthSlecter";
import HealthSummary from "../components/HealthSummary";
import SleepTimeChart from "../components/SleepTimeChart";
import BodyWeightChart from "../components/BodyWeightChart";
import HealthTable from "../components/HealthTable";

const Health = () => {
  const commonPaperStyle = {
    height: "450px",
    display: "flex",
    flexDirection: "column",
    p: 2,
    borderRadius: "5px",
    overflow: "auto",
    border: "solid 1px #ccc",
  };

  const [page, setPage] = useState(0);

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
        <HealthSummary />
      </Grid>
      <Grid item xs={12} lg={6}>
        <Paper sx={commonPaperStyle} variant="outlined">
          <SleepTimeChart />
        </Paper>
      </Grid>
      <Grid item xs={12} lg={6}>
        <Paper sx={commonPaperStyle} variant="outlined">
          <BodyWeightChart />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <HealthTable page={page} setPage={setPage} />
      </Grid>
    </Grid>
  );
};

export default Health;
