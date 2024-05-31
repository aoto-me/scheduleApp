import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  ListItemIcon,
  MenuItem,
  Stack,
  TextField,
  alpha,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Money, MoneyType } from "../types";
import MoneyIcons from "./common/MoneyIcons";
import { MonerySchema, monerySchema } from "../validations/sxhema";
import { useMoneyContext } from "../context/MoneyContext";
import { useCommonContext } from "../context/CommonContext";
import { theme } from "../theme/theme";
import { sendRequest } from "../utils/apiRequests";

interface MoneryFormProps {
  currentDay: string;
}

interface CategoryItem {
  label: string;
  icon: JSX.Element;
}

const MoneyForm = ({ currentDay }: MoneryFormProps) => {
  const { setMoneyData, selectedMoneyData, moneyData, setSelectedMoneyData } =
    useMoneyContext();
  const { isMobile, setIsDialogOpen, userId, csrfToken } = useCommonContext();

  // MoneyIconsから収入と支出のカテゴリを生成
  const expenseCategories: CategoryItem[] = Object.entries(MoneyIcons)
    .filter(([category]) => category !== "給与" && category !== "副収入")
    .map(([label, icon]) => ({
      label,
      icon,
    }));
  const incomeCategories: CategoryItem[] = Object.entries(MoneyIcons)
    .filter(
      ([category]) =>
        category === "給与" || category === "副収入" || category === "その他",
    )
    .map(([label, icon]) => ({
      label,
      icon,
    }));

  const [categories, setCategories] = useState(expenseCategories);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isDelLoading, setIsDelLoading] = useState(false);

  // react-hook-formの初期値
  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<MonerySchema>({
    defaultValues: {
      date: currentDay,
      type: "支出",
      category: "",
      amount: 0,
      content: "",
    },
    resolver: zodResolver(monerySchema),
  });

  // 収支タイプの変更に合わせてカテゴリを変更した際のエラーの解消
  useEffect(() => {
    //  選択肢が更新されたか確認(選択されたデータが同じカテゴリを含んでいるか)
    if (selectedMoneyData) {
      const categoryExists = categories.some(
        (category) => category.label === selectedMoneyData.category,
      );
      setValue("category", categoryExists ? selectedMoneyData.category : "");
    }
  }, [selectedMoneyData, categories]);

  // 収支タイプの切り替え
  const moneyTypeToggle = (type: MoneyType) => {
    setValue("category", "");
    setValue("type", type);
  };

  // 現在の収支タイプを監視
  const currentType = watch("type");

  // 収支タイプの変更に合わせてカテゴリを変更
  useEffect(() => {
    const newCategories =
      currentType === "支出" ? expenseCategories : incomeCategories;
    setCategories(newCategories);
  }, [currentType]);

  // 新規データの保存処理
  const saveMoneyData = async (data: MonerySchema) => {
    setIsSaveLoading(true);
    const apiUrl = process.env.REACT_APP_MONEY_API;
    const urlSearchParams = new URLSearchParams();
    Object.keys(data).forEach((key) => {
      const val = data[key as keyof MonerySchema];
      urlSearchParams.append(key, val.toString());
    });
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    urlSearchParams.append("action", "save");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      // 取得済みのデータを更新する
      const newMoneyData = {
        id: Number(response.id),
        ...data,
      } as Money;
      setMoneyData((prevMoneyData) => [...prevMoneyData, newMoneyData]);
      reset();
    }
    setIsSaveLoading(false);
  };

  // データ削除処理
  const deleteMoneyData = async () => {
    if (!selectedMoneyData) {
      return;
    }
    setIsDelLoading(true);
    const apiUrl = process.env.REACT_APP_DEL_API;
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append("id", selectedMoneyData.id?.toString());
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    urlSearchParams.append("tableType", "money");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      const newMoneyData = moneyData.filter(
        (data) => data.id !== selectedMoneyData.id,
      );
      setMoneyData(newMoneyData);
      setSelectedMoneyData(null);
      reset();
      if (isMobile) {
        setIsDialogOpen(false);
      }
    }
    setIsDelLoading(false);
  };

  // 既存データの更新処理
  const updateMoneyData = async (data: MonerySchema) => {
    setIsSaveLoading(true);
    const apiUrl = process.env.REACT_APP_MONEY_API;
    const urlSearchParams = new URLSearchParams();
    Object.keys(data).forEach((key) => {
      const val = data[key as keyof MonerySchema];
      urlSearchParams.append(key, val?.toString() || "");
    });
    urlSearchParams.append("id", selectedMoneyData?.id.toString() || "");
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    urlSearchParams.append("action", "update");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      const newMoneyData = moneyData.map((prevMoneyData) =>
        prevMoneyData.id === selectedMoneyData?.id
          ? { ...prevMoneyData, ...data }
          : prevMoneyData,
      );
      setMoneyData(newMoneyData as Money[]);
      reset();
      setSelectedMoneyData(null);
      if (isMobile) {
        setIsDialogOpen(false);
      }
    }
    setIsSaveLoading(false);
  };

  // フォームの送信処理
  const onSubmit: SubmitHandler<MonerySchema> = async (data) => {
    if (selectedMoneyData) {
      await updateMoneyData(data);
    } else {
      await saveMoneyData(data);
    }
  };

  // 取引が選択された場合にフォームにデータをセット
  useEffect(() => {
    if (selectedMoneyData) {
      if (selectedMoneyData.type === "支出") {
        setCategories(expenseCategories);
      } else {
        setCategories(incomeCategories);
      }
      setValue("date", selectedMoneyData.date);
      setValue("type", selectedMoneyData.type);
      setValue("category", selectedMoneyData.category);
      setValue("amount", Number(selectedMoneyData.amount));
      setValue("content", selectedMoneyData.content);
    } else {
      reset({
        date: currentDay,
        type: "支出",
        category: "",
        amount: 0,
        content: "",
      });
    }
  }, [selectedMoneyData, currentDay]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <ButtonGroup fullWidth>
              <Button
                variant={field.value === "支出" ? "contained" : "outlined"}
                color="secondary"
                onClick={() => {
                  moneyTypeToggle("支出");
                }}
                sx={
                  field.value === "支出"
                    ? {
                        backgroundImage: "none",
                        pointerEvents: "none",
                        backgroundColor: theme.palette.expenseColor.dark,
                        color: "#fff",
                        "&::before": {
                          display: "none !important",
                        },
                        "&::after": {
                          display: "none !important",
                        },
                        "&:hover": {
                          backgroundColor: theme.palette.expenseColor.dark,
                          backgroundImage: "none !important",
                        },
                      }
                    : {
                        color: theme.palette.expenseColor.dark,
                        "&:hover": {
                          borderColor: theme.palette.expenseColor.dark,
                          backgroundColor: alpha(
                            theme.palette.expenseColor.dark,
                            0.1,
                          ),
                        },
                      }
                }
              >
                支出
              </Button>
              <Button
                onClick={() => {
                  moneyTypeToggle("収入");
                }}
                variant={field.value === "収入" ? "contained" : "outlined"}
                color="secondary"
                sx={
                  field.value === "収入"
                    ? {
                        backgroundImage: "none",
                        pointerEvents: "none",
                        backgroundColor: theme.palette.incomeColor.dark,
                        color: "#fff",
                        "&::before": {
                          display: "none !important",
                        },
                        "&::after": {
                          display: "none !important",
                        },
                        "&:hover": {
                          backgroundColor: theme.palette.incomeColor.dark,
                          backgroundImage: "none !important",
                        },
                      }
                    : {
                        color: theme.palette.incomeColor.dark,
                        "&:hover": {
                          borderColor: theme.palette.incomeColor.dark,
                          backgroundColor: alpha(
                            theme.palette.incomeColor.dark,
                            0.1,
                          ),
                        },
                      }
                }
              >
                収入
              </Button>
            </ButtonGroup>
          )}
        />
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="日付"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              error={!!errors.date}
              helperText={errors.date?.message}
            />
          )}
        />
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <TextField
              error={!!errors.category}
              helperText={errors.category?.message}
              {...field}
              label="カテゴリ"
              select
              InputLabelProps={{
                htmlFor: "category",
              }}
              inputProps={{ id: "category" }}
            >
              {categories.map((category, index) => (
                <MenuItem key={index} value={category.label}>
                  <ListItemIcon sx={{ verticalAlign: "text-bottom" }}>
                    {category.icon}
                  </ListItemIcon>
                  {category.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <TextField
              error={!!errors.amount}
              helperText={errors.amount?.message}
              {...field}
              value={field.value === 0 ? "" : field.value}
              label="金額"
              type="number"
              // テキストフィールドに入力された値はテキストとして扱われるため
              onChange={(e) => {
                const newValue = parseInt(e.target.value, 10) || 0;
                field.onChange(newValue);
              }}
            />
          )}
        />
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <TextField
              error={!!errors.content}
              helperText={errors.content?.message}
              {...field}
              label="内容"
              type="text"
            />
          )}
        />
        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSaveLoading}
          fullWidth
        >
          {isSaveLoading ? "　" : selectedMoneyData ? "更新" : "保存"}
        </LoadingButton>
        {selectedMoneyData && (
          <LoadingButton
            onClick={deleteMoneyData}
            variant="outlined"
            color={"secondary"}
            fullWidth
            loading={isDelLoading}
          >
            削除
          </LoadingButton>
        )}
      </Stack>
    </Box>
  );
};

export default MoneyForm;
