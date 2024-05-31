import React, { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { HealthSchema, healthSchema } from "../validations/sxhema";
import { sendRequest } from "../utils/apiRequests";
import { Health } from "../types";
import { useCommonContext } from "../context/CommonContext";
import { useHealthContext } from "../context/HealthContext";

interface HealthFormProps {
  currentDay: string;
}

const HealthForm = ({ currentDay }: HealthFormProps) => {
  const { isMobile, setIsDialogOpen, userId, setIsEntryDrawerOpen, csrfToken } =
    useCommonContext();
  const {
    selectedHealthData,
    setHealthData,
    healthData,
    setSelectedHealthData,
  } = useHealthContext();
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isDelLoading, setIsDelLoading] = useState(false);

  // React Hook Form を使うための基本設定
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
  } = useForm<HealthSchema>({
    defaultValues: {
      date: currentDay,
      upTime: `${currentDay} 00:00`,
      bedTime: `${currentDay} 00:00`,
      body: "0",
      headache: false,
      stomach: false,
      period: false,
      sleepless: false,
      cold: false,
      nausea: false,
      hayfever: false,
      depression: false,
      tired: false,
      other: false,
      memo: "",
    },
    resolver: zodResolver(healthSchema),
  });

  // 新規データの保存処理
  const saveHealthData = async (data: HealthSchema) => {
    setIsSaveLoading(true);
    const apiUrl = process.env.REACT_APP_HEALTH_API;
    const urlSearchParams = new URLSearchParams();
    Object.keys(data).forEach((key) => {
      const val = data[key as keyof HealthSchema];
      urlSearchParams.append(key, val?.toString());
    });
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    urlSearchParams.append("action", "save");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      // 取得済みのデータを更新する
      const newHealthData = {
        id: Number(response.id),
        date: data.date,
        upTime: data.upTime,
        bedTime: data.bedTime,
        body: data.body,
        headache: data.headache ? 1 : 0,
        stomach: data.stomach ? 1 : 0,
        period: data.period ? 1 : 0,
        sleepless: data.sleepless ? 1 : 0,
        cold: data.cold ? 1 : 0,
        nausea: data.nausea ? 1 : 0,
        hayfever: data.hayfever ? 1 : 0,
        depression: data.depression ? 1 : 0,
        tired: data.tired ? 1 : 0,
        other: data.other ? 1 : 0,
        memo: data.memo,
      } as Health;
      setHealthData((prevHealthData) => [...prevHealthData, newHealthData]);
      if (isMobile) {
        setIsDialogOpen(false);
      } else {
        setIsEntryDrawerOpen(false);
      }
    }
    setIsSaveLoading(false);
  };

  // データ削除処理
  const deleteHealthData = async () => {
    if (!selectedHealthData) {
      return;
    }
    setIsDelLoading(true);
    const apiUrl = process.env.REACT_APP_DEL_API;
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append("id", selectedHealthData.id?.toString());
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    urlSearchParams.append("tableType", "health");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      const newHealthData = healthData.filter(
        (data) => data.id !== selectedHealthData?.id,
      );
      setHealthData(newHealthData);
      setSelectedHealthData(null);
      reset();
      if (isMobile) {
        setIsDialogOpen(false);
      } else {
        setIsEntryDrawerOpen(false);
      }
    }
    setIsDelLoading(false);
  };

  // 既存データの更新処理
  const updateHealthData = async (data: HealthSchema) => {
    setIsSaveLoading(true);
    const apiUrl = process.env.REACT_APP_HEALTH_API;
    const urlSearchParams = new URLSearchParams();
    Object.keys(data).forEach((key) => {
      const val = data[key as keyof HealthSchema];
      urlSearchParams.append(key, val?.toString() || "");
    });
    urlSearchParams.append("id", selectedHealthData?.id.toString() || "");
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    urlSearchParams.append("action", "update");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      const newHealthData = {
        id: selectedHealthData?.id,
        date: data.date,
        upTime: data.upTime,
        bedTime: data.bedTime,
        body: data.body,
        headache: data.headache ? 1 : 0,
        stomach: data.stomach ? 1 : 0,
        period: data.period ? 1 : 0,
        sleepless: data.sleepless ? 1 : 0,
        cold: data.cold ? 1 : 0,
        nausea: data.nausea ? 1 : 0,
        hayfever: data.hayfever ? 1 : 0,
        depression: data.depression ? 1 : 0,
        tired: data.tired ? 1 : 0,
        other: data.other ? 1 : 0,
        memo: data.memo,
      } as Health;
      const newHealthDatas = healthData.map((prevHealthData) =>
        prevHealthData.id === selectedHealthData?.id
          ? { ...prevHealthData, ...newHealthData }
          : prevHealthData,
      );
      setHealthData(newHealthDatas);
      if (isMobile) {
        setIsDialogOpen(false);
      } else {
        setIsEntryDrawerOpen(false);
      }
    }
    setIsSaveLoading(false);
  };

  // フォームの送信処理
  const onSubmit: SubmitHandler<HealthSchema> = async (data) => {
    if (selectedHealthData) {
      await updateHealthData(data);
    } else {
      await saveHealthData(data);
    }
  };

  // 取引が選択された場合にフォームにデータをセット
  useEffect(() => {
    if (selectedHealthData) {
      setValue("date", selectedHealthData.date);
      setValue("upTime", selectedHealthData.upTime);
      setValue("bedTime", selectedHealthData.bedTime);
      setValue("body", selectedHealthData.body);
      setValue("headache", Boolean(Number(selectedHealthData.headache)));
      setValue("stomach", Boolean(Number(selectedHealthData.stomach)));
      setValue("period", Boolean(Number(selectedHealthData.period)));
      setValue("sleepless", Boolean(Number(selectedHealthData.sleepless)));
      setValue("cold", Boolean(Number(selectedHealthData.cold)));
      setValue("nausea", Boolean(Number(selectedHealthData.nausea)));
      setValue("hayfever", Boolean(Number(selectedHealthData.hayfever)));
      setValue("depression", Boolean(Number(selectedHealthData.depression)));
      setValue("tired", Boolean(Number(selectedHealthData.tired)));
      setValue("other", Boolean(Number(selectedHealthData.other)));
      setValue("memo", selectedHealthData.memo);
    } else {
      reset({
        date: currentDay,
        upTime: `${currentDay} 00:00`,
        bedTime: `${currentDay} 00:00`,
        body: "0",
        headache: false,
        stomach: false,
        period: false,
        sleepless: false,
        cold: false,
        nausea: false,
        hayfever: false,
        depression: false,
        tired: false,
        other: false,
        memo: "",
      });
    }
  }, [selectedHealthData, currentDay]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
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
          name="upTime"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="起床時間"
              type="datetime-local"
              InputLabelProps={{
                shrink: true,
              }}
              error={!!errors.upTime}
              helperText={errors.upTime?.message}
            />
          )}
        />
        <Controller
          name="bedTime"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="就寝時間"
              type="datetime-local"
              InputLabelProps={{
                shrink: true,
              }}
              error={!!errors.bedTime}
              helperText={errors.bedTime?.message}
            />
          )}
        />
        <Controller
          name="body"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="体重"
              type="string"
              InputLabelProps={{
                shrink: true,
              }}
              value={field.value === "0" ? "" : field.value}
              error={!!errors.body}
              helperText={errors.body?.message}
            />
          )}
        />
        <FormGroup sx={{ flexDirection: "row", flexWrap: "wrap" }}>
          <Controller
            name="headache"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                {...field}
                control={<Checkbox />}
                label="頭痛"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="stomach"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                {...field}
                control={<Checkbox />}
                label="腹痛・胃痛"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="period"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                {...field}
                control={<Checkbox />}
                label="生理"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="cold"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                {...field}
                control={<Checkbox />}
                label="風邪・発熱"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="hayfever"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                {...field}
                control={<Checkbox />}
                label="花粉症"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="nausea"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                {...field}
                control={<Checkbox />}
                label="吐き気"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="sleepless"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                {...field}
                control={<Checkbox />}
                label="睡眠不足"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="tired"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                {...field}
                control={<Checkbox />}
                label="疲労感"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="depression"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                {...field}
                control={<Checkbox />}
                label="気分の落ち込み"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="other"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                {...field}
                control={<Checkbox />}
                label="その他の症状"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </FormGroup>

        <Controller
          name="memo"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="メモ"
              multiline
              rows={3}
              error={!!errors.memo}
              helperText={errors.memo?.message}
            />
          )}
        />
        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSaveLoading}
          fullWidth
        >
          {isSaveLoading ? "　" : selectedHealthData ? "更新" : "保存"}
        </LoadingButton>
        {selectedHealthData && (
          <LoadingButton
            onClick={deleteHealthData}
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
export default HealthForm;
