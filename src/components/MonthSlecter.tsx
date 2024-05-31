import React from "react";
import { Box, Button } from "@mui/material";
import { CSSProperties } from "@mui/material/styles/createMixins";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { ja } from "date-fns/locale/ja";
import { addMonths } from "date-fns";
import { useCommonContext } from "../context/CommonContext";

interface MonthSlecterProps {
  setPage?: React.Dispatch<React.SetStateAction<number>>;
}

function MonthSlecter({ setPage }: MonthSlecterProps) {
  const { currentMonth, setCurrentMonth } = useCommonContext();

  const handlePreviosMonth = () => {
    const previousMonth = addMonths(currentMonth, -1);
    if (setPage) setPage(0);
    setCurrentMonth(previousMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    if (setPage) setPage(0);
    setCurrentMonth(nextMonth);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      if (setPage) setPage(0);
      setCurrentMonth(date);
    }
  };

  const buttonStyle: CSSProperties = {
    padding: "13px 12px",
    minWidth: "55px",
    boxShadow: "none",
    borderRadius: "3px",
    borderColor: "#555",
    backgroundImage:
      "linear-gradient(180deg, rgba(75, 75, 75, 0.95), rgba(75, 75, 75, 0.95)), url(/img/noise.webp)",
    backgroundSize: "auto, 125px",
  };

  const buttonStyleHover: CSSProperties = {
    backgroundImage:
      "linear-gradient(180deg, rgba(120, 120, 120, 0.95), rgba(120, 120, 120, 0.95)), url(/img/noise.webp)",
  };

  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      adapterLocale={ja}
      dateFormats={{ year: "yyyy年", month: "M月" }}
    >
      <Box
        sx={{
          mt: { xs: 3, lg: 0 },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          onClick={handlePreviosMonth}
          sx={{
            ...buttonStyle,
            "&&:hover": {
              ...buttonStyleHover,
            },
          }}
        >
          <KeyboardArrowLeftIcon sx={{ color: "#fff" }} />
        </Button>
        <DatePicker
          onChange={handleDateChange}
          value={currentMonth}
          sx={{ mx: 2, backgroundColor: "white" }}
          views={["year", "month"]}
          format="yyyy年M月"
          slotProps={{
            toolbar: {
              toolbarFormat: "yyyy年M月",
            },
          }}
        />
        <Button
          onClick={handleNextMonth}
          sx={{
            ...buttonStyle,
            "&&:hover": {
              ...buttonStyleHover,
            },
          }}
        >
          <KeyboardArrowRightIcon sx={{ color: "#fff" }} />
        </Button>
      </Box>
    </LocalizationProvider>
  );
}

export default MonthSlecter;
