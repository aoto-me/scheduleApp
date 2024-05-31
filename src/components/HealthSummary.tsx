import { useEffect, useState } from "react";
import { Grid, Paper, Stack, Typography } from "@mui/material";
import { CSSProperties } from "@mui/material/styles/createMixins";
import HotelSharpIcon from "@mui/icons-material/HotelSharp";
import AccessibilityNewSharpIcon from "@mui/icons-material/AccessibilityNewSharp";
import { addMonths } from "date-fns";
import useFilterMonthlyData from "../hooks/useFilterMonthlyData";
import useFilterCurrentMonthData from "../hooks/useFilterCurrentMonthData";
import useFilterCurrentMonthAndLastDayOfLastMonthData from "../hooks/useFilterCurrentMonthAndLastDayOfLastMonthData";
import useFilterMonthAndLastDayOfLastMonthData from "../hooks/useFilterMonthAndLastDayOfLastMonthData";
import { calculateTimeDifferenceMs } from "../utils/timeCalculations";
import {
  calculateAverageSleepTime,
  calculateSleepTime,
} from "../utils/sleepTimeCalculations";
import { useHealthContext } from "../context/HealthContext";
import { useCommonContext } from "../context/CommonContext";
import { calculateAverageBodyWeight } from "../utils/weightCalculations";

interface DifferenceSleepTimeType {
  hour: number;
  minute: number;
  negative: boolean;
}

const HealthSummary = () => {
  const { currentMonth } = useCommonContext();
  const { healthData } = useHealthContext();
  const [averageBodyWeight, setAverageBodyWeight] = useState(0);
  const [averageBodyWeightLastMonth, setAverageBodyWeightLastMonth] =
    useState(0);
  // 睡眠時間の初期値
  const sleepTimeObject = {
    hour: 0,
    minute: 0,
    ms: 0,
  };
  const [averageSleepTimeCurrentMonth, setAverageSleepTimeCurrentMonth] =
    useState(sleepTimeObject);
  const [averageSleepTimeLastMonth, setAverageSleepTimeLastMonth] =
    useState(sleepTimeObject);
  const [differenceSleepTime, setDifferenceSleepTime] =
    useState<DifferenceSleepTimeType | null>(null);

  // 今月のデータ
  const monthlyHealthData = useFilterCurrentMonthData(healthData);
  // 先月のデータ
  const lastMonthHealthData = useFilterMonthlyData(
    healthData,
    addMonths(currentMonth, -1),
  );
  // 今月のデータ ＋ 先月末のデータを取得
  const monthlySleepData =
    useFilterCurrentMonthAndLastDayOfLastMonthData(healthData);
  // 先月のデータ ＋ 先々月末のデータを取得
  const lastMonthSleepData = useFilterMonthAndLastDayOfLastMonthData(
    healthData,
    addMonths(currentMonth, -1),
  );

  // 今月と先月の平均睡眠時間をセット
  useEffect(() => {
    // 今月
    const sleepTimeData = calculateSleepTime(monthlySleepData, true);
    const averageSleepTime = calculateAverageSleepTime(sleepTimeData);
    setAverageSleepTimeCurrentMonth(averageSleepTime);
    // 先月
    const lastMonthSleepTimeData = calculateSleepTime(lastMonthSleepData, true);
    const averageSleepTimeLastMonthResult = calculateAverageSleepTime(
      lastMonthSleepTimeData,
    );
    setAverageSleepTimeLastMonth(averageSleepTimeLastMonthResult);
  }, [currentMonth, healthData, monthlySleepData]);

  // 今月と先月の平均睡眠時間の差をセット
  useEffect(() => {
    if (
      averageSleepTimeCurrentMonth.ms === 0 ||
      averageSleepTimeLastMonth.ms === 0
    ) {
      setDifferenceSleepTime(null);
      return;
    }
    const differenceTime = calculateTimeDifferenceMs(
      averageSleepTimeCurrentMonth.ms,
      averageSleepTimeLastMonth.ms,
    );
    setDifferenceSleepTime(differenceTime);
  }, [averageSleepTimeCurrentMonth, averageSleepTimeLastMonth]);

  // 今月と先月の平均体重をセット
  useEffect(() => {
    setAverageBodyWeight(calculateAverageBodyWeight(monthlyHealthData));
    setAverageBodyWeightLastMonth(
      calculateAverageBodyWeight(lastMonthHealthData),
    );
  }, [monthlyHealthData, healthData]);

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
    <Grid container spacing={{ xs: 1, sm: 2 }}>
      <Grid item xs={12} md={6}>
        <Paper
          variant="outlined"
          sx={{
            ...paperStyle,
            "&&::before": {
              ...paperStyleBefore,
            },
          }}
        >
          <Stack direction={"row"} alignItems={"center"}>
            <HotelSharpIcon
              sx={{
                padding: "0.2rem",
                marginRight: 1,
                fontSize: "2rem",
              }}
            />
            <Typography fontWeight={"bold"} variant="body2">
              平均睡眠時間
            </Typography>
          </Stack>
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"flex-end"}
          >
            <Typography
              className="font-serif"
              textAlign={"right"}
              variant="h5"
              fontWeight={"700"}
              letterSpacing={"0.05em"}
            >
              {averageSleepTimeCurrentMonth.hour !== 0
                ? averageSleepTimeCurrentMonth.hour
                : "--"}
              時間
              {averageSleepTimeCurrentMonth.hour !== 0
                ? averageSleepTimeCurrentMonth.minute
                : "--"}
              分
            </Typography>
          </Stack>
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"flex-end"}
            flexWrap={"wrap"}
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
              先月比
            </Typography>
            <Typography
              className="font-serif"
              textAlign={"right"}
              fontWeight={"500"}
              ml={1.5}
              letterSpacing={"0.05em"}
            >
              {differenceSleepTime === null ? (
                "--時間--分"
              ) : (
                <>
                  {differenceSleepTime.negative ? "- " : "+ "}
                  {differenceSleepTime.hour !== 0 &&
                    `${differenceSleepTime.hour}時間`}
                  {differenceSleepTime.minute !== 0 &&
                    `${differenceSleepTime.minute}分`}
                  {differenceSleepTime.minute === 0 &&
                    differenceSleepTime.hour === 0 &&
                    `${differenceSleepTime.minute}分`}
                </>
              )}
            </Typography>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper
          variant="outlined"
          sx={{
            ...paperStyle,
            "&&::before": {
              ...paperStyleBefore,
            },
          }}
        >
          <Stack direction={"row"} alignItems={"center"}>
            <AccessibilityNewSharpIcon
              sx={{
                padding: "0.2rem",
                marginRight: 0.5,
                fontSize: "2rem",
              }}
            />
            <Typography fontWeight={"bold"} variant="body2">
              平均体重
            </Typography>
          </Stack>
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"flex-end"}
          >
            <Typography
              className="font-serif"
              textAlign={"right"}
              variant="h5"
              fontWeight={"700"}
              letterSpacing={"0.05em"}
            >
              {averageBodyWeight === 0 ? "--" : averageBodyWeight}kg
            </Typography>
          </Stack>
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"flex-end"}
            flexWrap={"wrap"}
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
              先月比
            </Typography>

            {averageBodyWeight === 0 || averageBodyWeightLastMonth === 0 ? (
              <Typography
                className="font-serif"
                textAlign={"right"}
                fontWeight={"500"}
                ml={1.5}
                letterSpacing={"0.05em"}
              >
                --kg
              </Typography>
            ) : (
              <Typography
                className="font-serif"
                textAlign={"right"}
                fontWeight={"500"}
                ml={1.5}
                letterSpacing={"0.05em"}
              >
                {averageBodyWeight > averageBodyWeightLastMonth ? "+ " : "- "}
                {Math.abs(
                  Math.round(
                    (averageBodyWeight - averageBodyWeightLastMonth) * 10,
                  ) / 10,
                )}
                kg
              </Typography>
            )}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default HealthSummary;
