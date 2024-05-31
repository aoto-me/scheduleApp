import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  List,
  ListItem,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { CSSProperties } from "@mui/material/styles/createMixins";
import ArrowUpwardSharpIcon from "@mui/icons-material/ArrowUpwardSharp";
import ArrowDownwardSharpIcon from "@mui/icons-material/ArrowDownwardSharp";
import NotesSharpIcon from "@mui/icons-material/NotesSharp";
import AddCircleSharpIcon from "@mui/icons-material/AddCircleSharp";
import MoneyIcons from "./common/MoneyIcons";
import { FormType, Money } from "../types";
import { financeCalculations } from "../utils/financeCalculations";
import { formatCurrency } from "../utils/formatting";
import { useMoneyContext } from "../context/MoneyContext";

interface DailyMoneySummaryProps {
  dailyMoneyData: Money[];
  toggleForm: (type: FormType) => void;
  onSelectMoneyData: (data: Money) => void;
}

const DailyMoneySummary = ({
  dailyMoneyData,
  toggleForm,
  onSelectMoneyData,
}: DailyMoneySummaryProps) => {
  const theme = useTheme();
  const { income, expense } = financeCalculations(dailyMoneyData);
  const [sortedMoneyData, setSortedMoneyData] = useState<Money[]>([]);
  const { setSelectedMoneyData } = useMoneyContext();

  // タイプの順番に基づいてソートする
  useEffect(() => {
    setSortedMoneyData(
      [...dailyMoneyData].sort((a, b) => {
        if (a.type === "支出" && b.type === "収入") return -1;
        if (a.type === "収入" && b.type === "支出") return 1;
        return 0;
      }),
    );
  }, [dailyMoneyData]);

  const totalCardStyle: CSSProperties = {
    border: "none",
    bgcolor: theme.palette.grey[200],
    flexGrow: 1,
  };

  const totalCardContentStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 10px !important",
  };

  return (
    <Box>
      <Grid container spacing={1}>
        <Grid item xs={6} display={"flex"}>
          <Card
            elevation={0}
            sx={{
              ...totalCardStyle,
            }}
          >
            <CardContent
              sx={{
                ...totalCardContentStyle,
              }}
            >
              <ArrowUpwardSharpIcon
                fontSize="small"
                sx={{
                  color: theme.palette.grey[500],
                }}
              />
              <Typography
                textAlign="right"
                fontWeight="fontWeightBold"
                sx={{
                  wordBreak: "break-all",
                  color: theme.palette.incomeColor.main,
                }}
              >
                ¥{formatCurrency(income)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} display={"flex"}>
          <Card
            elevation={0}
            sx={{
              ...totalCardStyle,
            }}
          >
            <CardContent
              sx={{
                ...totalCardContentStyle,
              }}
            >
              <ArrowDownwardSharpIcon
                fontSize="small"
                sx={{
                  color: theme.palette.grey[500],
                }}
              />
              <Typography
                textAlign="right"
                fontWeight="fontWeightBold"
                sx={{
                  color: theme.palette.expenseColor.main,
                  wordBreak: "break-all",
                }}
              >
                ¥{formatCurrency(expense)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: "8px 0",
        }}
      >
        <Box display="flex" alignItems="center">
          <NotesSharpIcon sx={{ mr: 1 }} />
          <Typography variant="body1">明細</Typography>
        </Box>
        <Button
          startIcon={<AddCircleSharpIcon />}
          color="primary"
          onClick={() => {
            setSelectedMoneyData(null);
            toggleForm("money");
          }}
        >
          明細を追加
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <List aria-label="明細" sx={{ paddingTop: 0 }}>
          <Stack spacing={1}>
            {sortedMoneyData.map((data, index) => (
              <ListItem key={index} disablePadding>
                <Card
                  variant="outlined"
                  sx={{
                    width: "100%",
                    bgcolor: "#fff",
                  }}
                  onClick={() => onSelectMoneyData(data)}
                >
                  <CardActionArea>
                    <CardContent
                      sx={{ padding: "10px 12px 10px 8px !important" }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                      >
                        <Box
                          display={"flex"}
                          flexDirection={"column"}
                          alignItems={"center"}
                          justifyContent={"center"}
                          width={"42px"}
                          flexShrink={0}
                          flexGrow={0}
                        >
                          {data.type === "収入" ? (
                            <>
                              {React.cloneElement(MoneyIcons[data.category], {
                                style: {
                                  color: "#485973",
                                },
                              })}
                            </>
                          ) : (
                            <>
                              {React.cloneElement(MoneyIcons[data.category], {
                                style: {
                                  color: "#954545",
                                },
                              })}
                            </>
                          )}
                          <Typography
                            variant="caption"
                            display="block"
                            align="center"
                            lineHeight={1}
                            sx={{
                              mt: "4px",
                              fontSize: "0.7rem",
                              color:
                                data.type === "収入"
                                  ? theme.palette.incomeColor.dark
                                  : theme.palette.expenseColor.dark,
                            }}
                          >
                            {data.category}
                          </Typography>
                        </Box>
                        <Typography
                          lineHeight={1.35}
                          variant="body2"
                          flexGrow={1}
                          flexShrink={1}
                        >
                          {data.content}
                        </Typography>
                        <Typography
                          gutterBottom
                          textAlign={"right"}
                          flexGrow={0}
                          flexShrink={0}
                          variant="caption"
                          fontWeight={500}
                          lineHeight={1.35}
                          sx={{
                            wordBreak: "break-all",
                          }}
                        >
                          ¥{formatCurrency(Number(data.amount))}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </ListItem>
            ))}
          </Stack>
        </List>
      </Box>
    </Box>
  );
};
export default DailyMoneySummary;
