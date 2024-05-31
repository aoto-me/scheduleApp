import { Box, Typography } from "@mui/material";
import React from "react";

const NotFound = () => (
  <Box
    p={3}
    display="flex"
    alignItems="center"
    justifyContent="center"
    sx={{
      minHeight: "100vh",
    }}
  >
    <Typography variant="h5" fontWeight={700} className="font-serif">
      ページが見つかりません
    </Typography>
  </Box>
);

export default NotFound;
