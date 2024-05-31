import React, { useEffect, useState } from "react";
import { Box, IconButton, Stack, TextField, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { zodResolver } from "@hookform/resolvers/zod";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { SectionSchema, sectionSchema } from "../validations/sxhema";
import { sendRequest } from "../utils/apiRequests";
import { Section, SendSection } from "../types";
import { useProjectContext } from "../context/ProjectContext";
import { useCommonContext } from "../context/CommonContext";

const AddSectionForm = () => {
  const { userId, csrfToken } = useCommonContext();
  const {
    selectedProjectData,
    handleFormClose,
    sectionData,
    setSectionData,
    selectedSectionDataArr,
    selectedSectionData,
    setSelectedSectionData,
    selectedTaskDataArr,
  } = useProjectContext();

  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isDelLoading, setIsDelLoading] = useState(false);

  // react-hook-formの初期値
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<SectionSchema>({
    defaultValues: {
      name: "",
      memo: "",
    },
    resolver: zodResolver(sectionSchema),
  });

  // 新規データの保存処理
  const saveSectionData = async (data: SendSection) => {
    setIsSaveLoading(true);
    const apiUrl = process.env.REACT_APP_SECTION_API;
    const urlSearchParams = new URLSearchParams();
    Object.keys(data).forEach((key) => {
      const val = data[key as keyof SendSection];
      urlSearchParams.append(key, val?.toString() || "");
    });
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    urlSearchParams.append("action", "save");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      // SectionDataの取得済みのデータを更新する
      const newSectionData = {
        id: Number(response.id),
        projectId: data.projectId,
        name: data.name,
        sort: data.sort,
        memo: data.memo,
        dragType: "section",
      } as Section;
      setSectionData((prevSectionData) => [...prevSectionData, newSectionData]);
      // フォームを閉じる
      reset();
      handleFormClose();
    }
    setIsSaveLoading(false);
  };

  // データ削除処理
  const deleteSectionData = async () => {
    if (!selectedSectionData) return;
    setIsDelLoading(true);
    if (
      selectedTaskDataArr.filter(
        (data) => data.sectionId === selectedSectionData.id,
      ).length > 0
    ) {
      alert("セクションにタスクが含まれているため削除できません");
      setIsDelLoading(false);
      return;
    }
    const apiUrl = process.env.REACT_APP_DEL_API;
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append("id", selectedSectionData.id.toString());
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    urlSearchParams.append("tableType", "section");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      // 取得済みのデータを更新する
      setSectionData((prev) =>
        prev.filter((data) => data.id !== selectedSectionData.id),
      );
      // フォームを閉じる
      reset();
      handleFormClose();
      setSelectedSectionData(null);
    }
    setIsDelLoading(false);
  };

  // 既存データの更新処理
  const updateSectionData = async (data: SendSection) => {
    setIsSaveLoading(true);
    const apiUrl = process.env.REACT_APP_SECTION_API;
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append("id", selectedSectionData?.id.toString() || "");
    Object.keys(data).forEach((key) => {
      const val = data[key as keyof SendSection];
      urlSearchParams.append(key, val?.toString() || "");
    });
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    urlSearchParams.append("action", "update");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      // 取得済みのデータを更新する
      const newSectionData = sectionData.map((prevSectionData) =>
        prevSectionData.id === selectedSectionData?.id
          ? { ...prevSectionData, ...data }
          : prevSectionData,
      );
      setSectionData(newSectionData);
      // フォームを閉じる
      reset();
      handleFormClose();
    }
    setIsSaveLoading(false);
  };

  // フォームの送信処理
  const onSubmit: SubmitHandler<SectionSchema> = async (data) => {
    if (selectedSectionData) {
      const sendData: SendSection = {
        projectId: selectedSectionData.projectId,
        name: data.name,
        sort: selectedSectionData.sort,
        memo: data.memo,
      };
      await updateSectionData(sendData);
    } else {
      const sendData: SendSection = {
        projectId: selectedProjectData?.id || 0,
        name: data.name,
        sort: selectedSectionDataArr.length,
        memo: data.memo,
      };
      await saveSectionData(sendData);
    }
  };

  // 取引が選択された場合にフォームにデータをセット
  useEffect(() => {
    if (selectedSectionData) {
      setValue("name", selectedSectionData.name);
      setValue("memo", selectedSectionData.memo);
    } else {
      reset({
        name: "",
        memo: "",
      });
    }
  }, [sectionData, selectedSectionData]);

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"flex-start"}
        mb={2}
      >
        <Typography
          variant="h6"
          className="font-serif"
          fontWeight={700}
          mt={0.5}
        >
          {selectedSectionData ? "セクションの編集" : "セクションの追加"}
        </Typography>
        <IconButton
          onClick={handleFormClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseSharpIcon />
        </IconButton>
      </Box>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                required
                error={!!errors.name}
                helperText={errors.name?.message}
                {...field}
                label="セクション名"
                type="text"
              />
            )}
          />
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
            {isSaveLoading ? "　" : selectedSectionData ? "更新" : "保存"}
          </LoadingButton>
          {selectedSectionData && (
            <LoadingButton
              onClick={deleteSectionData}
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
    </>
  );
};

export default AddSectionForm;
