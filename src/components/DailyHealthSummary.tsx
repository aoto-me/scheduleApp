import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { CSSProperties } from "@mui/material/styles/createMixins";
import { grey } from "@mui/material/colors";
import AccessibilityNewSharpIcon from "@mui/icons-material/AccessibilityNewSharp";
import AddCircleSharpIcon from "@mui/icons-material/AddCircleSharp";
import HotelSharpIcon from "@mui/icons-material/HotelSharp";
import { calculateTimeDifference } from "../utils/timeCalculations";
import { FormType, Health } from "../types";

interface DailyHealthSummaryProps {
  todayAndYesterdayHealthData: {
    today: Health | undefined;
    yesterday: Health | undefined;
  };
  toggleForm: (type: FormType) => void;
}

const CardWithIcon = ({
  icon,
  value,
  color,
}: {
  icon: JSX.Element;
  value: string;
  color?: string;
}) => {
  const theme = useTheme();
  const cardStyle: CSSProperties = {
    flexGrow: 1,
    position: "relative",
    overflow: "hidden",
    backgroundColor: color || theme.palette.secondary.main,
    border: "none",
    borderRadius: "4px",
  };

  const cardStyleBefore: CSSProperties = {
    content: "''",
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "calc(100% - 6px)",
    height: "calc(100% - 6px)",
    border: `solid 1px ${theme.palette.grey[200]}`,
    transform: "translate(-50%, -50%)",
    zIndex: 2,
    borderRadius: "2px",
  };

  const cardContentStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    padding: "14px 16px !important",
    paddingBottom: "14px !important",
  };

  return (
    <Card
      variant="outlined"
      sx={{
        ...cardStyle,
        "&::before": {
          ...cardStyleBefore,
        },
      }}
    >
      <CardContent sx={{ ...cardContentStyle }}>
        {icon}
        <Typography
          color={"#fff"}
          paddingLeft={1}
          fontWeight={500}
          letterSpacing={0.5}
          sx={{ wordBreak: "break-all" }}
          fontSize={13}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

const DailyHealthSummary = ({
  todayAndYesterdayHealthData,
  toggleForm,
}: DailyHealthSummaryProps) => {
  const theme = useTheme();
  const [sleepTime, setSleepTime] = useState<{ hour: number; minute: number }>({
    hour: 0,
    minute: 0,
  });

  // sleepTimeの値をセットする
  useEffect(() => {
    if (
      !todayAndYesterdayHealthData.yesterday ||
      !todayAndYesterdayHealthData.today ||
      todayAndYesterdayHealthData.yesterday.bedTime.includes("00:00:00") ||
      todayAndYesterdayHealthData.today.upTime.includes("00:00:00")
    ) {
      setSleepTime({ hour: 0, minute: 0 });
    } else {
      const { hour, minute } = calculateTimeDifference(
        todayAndYesterdayHealthData.yesterday.bedTime,
        todayAndYesterdayHealthData.today.upTime,
      );
      setSleepTime({ hour, minute });
    }
  }, [todayAndYesterdayHealthData]);

  const cardStyle: CSSProperties = {
    flexGrow: 1,
    position: "relative",
    overflow: "hidden",
    backgroundColor: theme.palette.secondary.main,
    border: "none",
    borderRadius: "4px",
  };

  const cardStyleBefore: CSSProperties = {
    content: "''",
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "calc(100% - 6px)",
    height: "calc(100% - 6px)",
    border: `solid 1px ${theme.palette.grey[200]}`,
    transform: "translate(-50%, -50%)",
    zIndex: 2,
    borderRadius: "2px",
  };

  const chipStyle: CSSProperties = {
    marginBottom: 1,
    marginRight: 1,
    backgroundColor: "white",
    color: grey[700],
    height: "25px",
    padding: "3px",
  };

  return (
    <Stack spacing={1}>
      <Grid
        container
        rowSpacing={1}
        columnSpacing={1}
        sx={{ marginTop: "-8px !important", marginLeft: "-8px !important" }}
      >
        <Grid item xs={6} display={"flex"}>
          <CardWithIcon
            icon={
              <HotelSharpIcon
                fontSize="small"
                sx={{
                  color: "#fff",
                }}
              />
            }
            value={
              sleepTime.hour === 0 && sleepTime.minute === 0
                ? "--時間--分"
                : `${(sleepTime.hour !== 0 && `${sleepTime.hour}時間`) || ""}${(sleepTime.minute !== 0 && `${sleepTime.minute}分`) || ""}`
            }
          />
        </Grid>
        <Grid item xs={6} display={"flex"}>
          <CardWithIcon
            icon={
              <AccessibilityNewSharpIcon
                fontSize="small"
                sx={{
                  color: "#fff",
                }}
              />
            }
            value={
              todayAndYesterdayHealthData.today?.body === "0" ||
              !todayAndYesterdayHealthData.today
                ? "--kg"
                : `${todayAndYesterdayHealthData.today?.body}kg`
            }
          />
        </Grid>

        {todayAndYesterdayHealthData.today === undefined ||
        (todayAndYesterdayHealthData.today?.headache === 0 &&
          todayAndYesterdayHealthData.today?.stomach === 0 &&
          todayAndYesterdayHealthData.today?.period === 0 &&
          todayAndYesterdayHealthData.today?.cold === 0 &&
          todayAndYesterdayHealthData.today?.hayfever === 0 &&
          todayAndYesterdayHealthData.today?.nausea === 0 &&
          todayAndYesterdayHealthData.today?.sleepless === 0 &&
          todayAndYesterdayHealthData.today?.tired === 0 &&
          todayAndYesterdayHealthData.today?.depression === 0 &&
          todayAndYesterdayHealthData.today?.other === 0 &&
          todayAndYesterdayHealthData.today?.memo === "") ? (
          <>
            <Grid item xs={12} display={"flex"}>
              <Card
                variant="outlined"
                sx={{
                  ...cardStyle,
                  "&::before": {
                    ...cardStyleBefore,
                  },
                }}
              >
                <CardContent sx={{ padding: "1rem !important" }}>
                  <Typography
                    color={"#fff"}
                    variant="caption"
                    lineHeight={1.5}
                    display={"block"}
                    textAlign={"center"}
                  >
                    体調に関する記録はありません
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} display={"flex"}>
              <Card
                variant="outlined"
                sx={{
                  ...cardStyle,
                  "&::before": {
                    ...cardStyleBefore,
                  },
                }}
              >
                <CardContent sx={{ padding: "1.35rem 1rem 1rem !important" }}>
                  <Box display={"flex"} flexWrap={"wrap"}>
                    {todayAndYesterdayHealthData.today?.headache === 1 && (
                      <Chip
                        size="small"
                        avatar={<Avatar alt="頭痛" src="/icon/headache.svg" />}
                        label="頭痛"
                        sx={{
                          ...chipStyle,
                        }}
                      />
                    )}

                    {todayAndYesterdayHealthData.today?.stomach === 1 && (
                      <Chip
                        size="small"
                        avatar={
                          <Avatar alt="腹痛・胃痛" src="/icon/stomach.svg" />
                        }
                        label="腹痛・胃痛"
                        sx={{
                          ...chipStyle,
                        }}
                      />
                    )}

                    {todayAndYesterdayHealthData.today?.period === 1 && (
                      <Chip
                        size="small"
                        avatar={<Avatar alt="生理" src="/icon/period.svg" />}
                        label="生理"
                        sx={{
                          ...chipStyle,
                        }}
                      />
                    )}

                    {todayAndYesterdayHealthData.today?.cold === 1 && (
                      <Chip
                        size="small"
                        avatar={
                          <Avatar alt="風邪・発熱" src="/icon/cold.svg" />
                        }
                        label="風邪・発熱"
                        sx={{
                          ...chipStyle,
                        }}
                      />
                    )}

                    {todayAndYesterdayHealthData.today?.hayfever === 1 && (
                      <Chip
                        size="small"
                        avatar={
                          <Avatar alt="花粉症" src="/icon/hayfever.svg" />
                        }
                        label="花粉症"
                        sx={{
                          ...chipStyle,
                        }}
                      />
                    )}

                    {todayAndYesterdayHealthData.today?.nausea === 1 && (
                      <Chip
                        size="small"
                        avatar={<Avatar alt="吐き気" src="/icon/nausea.svg" />}
                        label="吐き気"
                        sx={{
                          ...chipStyle,
                        }}
                      />
                    )}

                    {todayAndYesterdayHealthData.today?.sleepless === 1 && (
                      <Chip
                        size="small"
                        avatar={
                          <Avatar alt="睡眠不足" src="/icon/sleepless.svg" />
                        }
                        label="睡眠不足"
                        sx={{
                          ...chipStyle,
                        }}
                      />
                    )}

                    {todayAndYesterdayHealthData.today?.tired === 1 && (
                      <Chip
                        size="small"
                        avatar={<Avatar alt="疲労感" src="/icon/tired.svg" />}
                        label="疲労感"
                        sx={{
                          ...chipStyle,
                        }}
                      />
                    )}

                    {todayAndYesterdayHealthData.today?.depression === 1 && (
                      <Chip
                        size="small"
                        avatar={
                          <Avatar
                            alt="気分の落ち込み"
                            src="/icon/depression.svg"
                          />
                        }
                        label="気分の落ち込み"
                        sx={{
                          ...chipStyle,
                        }}
                      />
                    )}

                    {todayAndYesterdayHealthData.today?.other === 1 && (
                      <Chip
                        size="small"
                        avatar={
                          <Avatar alt="その他の症状" src="/icon/other.svg" />
                        }
                        label="その他の症状"
                        sx={{
                          ...chipStyle,
                        }}
                      />
                    )}
                  </Box>
                  {todayAndYesterdayHealthData.today !== undefined &&
                    todayAndYesterdayHealthData.today?.memo !== "" && (
                      <Typography
                        color={"#fff"}
                        fontWeight={500}
                        variant="caption"
                        lineHeight={1.35}
                        display={"inline-block"}
                      >
                        {todayAndYesterdayHealthData.today?.memo
                          .split("\n")
                          .map((line, memoIndex) => (
                            <React.Fragment key={memoIndex}>
                              {line}
                              <br />
                            </React.Fragment>
                          ))}
                      </Typography>
                    )}
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
      <Button
        fullWidth
        startIcon={<AddCircleSharpIcon />}
        onClick={() => {
          toggleForm("health");
        }}
      >
        健康情報を追加
      </Button>
    </Stack>
  );
};
export default DailyHealthSummary;
