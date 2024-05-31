import React, { useState } from "react";
import { Grid } from "@mui/material";
import MonthSlecter from "../components/MonthSlecter";
import TodoTable from "../components/TodoTable";
import MonthlyMemoArea from "../components/MonthlyMemoArea";

const Todo = () => {
  const [page, setPage] = useState(0);
  return (
    <Grid
      container
      spacing={2}
      sx={{
        mt: 0,
        p: "2rem min(4vw, 1.5rem)",
      }}
    >
      <Grid item xs={12}>
        <MonthSlecter setPage={setPage} />
      </Grid>
      <Grid item xs={12}>
        <TodoTable page={page} setPage={setPage} />
      </Grid>
      <Grid item xs={12}>
        <MonthlyMemoArea pageType="todo" />
      </Grid>
    </Grid>
  );
};

export default Todo;
