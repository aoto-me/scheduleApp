import React, { useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCommonContext } from "../context/CommonContext";
import { ProjectSchema, projectSchema } from "../validations/sxhema";
import { sendRequest } from "../utils/apiRequests";
import { Project, SendProject } from "../types";
import { useProjectContext } from "../context/ProjectContext";

const AddProjectForm = () => {
  const { userId, csrfToken } = useCommonContext();
  const { setProjectData, handleFormClose } = useProjectContext();
  const [isSaveLoading, setIsSaveLoading] = useState(false);

  // react-hook-formの初期値
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ProjectSchema>({
    defaultValues: {
      name: "",
      end: "",
      completed: false,
      memo: "",
    },
    resolver: zodResolver(projectSchema),
  });

  // 新規データの保存処理
  const saveProjectData = async (data: SendProject) => {
    setIsSaveLoading(true);
    const apiUrl = process.env.REACT_APP_PROJECT_API;
    const urlSearchParams = new URLSearchParams();
    Object.keys(data).forEach((key) => {
      const val = data[key as keyof SendProject];
      urlSearchParams.append(key, val?.toString() || "");
    });
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    urlSearchParams.append("action", "save");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      // ProjectDataの取得済みのデータを更新する
      const newProjectData = {
        id: Number(response.id),
        name: data.name,
        end: data.end,
        completed: data.completed,
        memo: data.memo,
      } as Project;
      setProjectData((prevProjectData) => [...prevProjectData, newProjectData]);
      // フォームを閉じる
      reset();
      handleFormClose();
    }
    setIsSaveLoading(false);
  };

  // フォームの送信処理
  const onSubmit: SubmitHandler<ProjectSchema> = async (data) => {
    // Form専用のProject型のオブジェクトを作成
    const sendData: SendProject = {
      name: data.name,
      end: data.end === "" ? "0000-00-00" : data.end,
      completed: data.completed ? 1 : 0,
      memo: data.memo,
    };
    await saveProjectData(sendData);
  };

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
          プロジェクトの追加
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
                label="プロジェクト名"
                type="text"
              />
            )}
          />
          <Controller
            name="end"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="期限"
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                error={!!errors.end}
                helperText={errors.end?.message}
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
          <Controller
            name="completed"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                {...field}
                control={<Checkbox />}
                label="終了"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSaveLoading}
            fullWidth
          >
            {isSaveLoading ? "　" : "保存"}
          </LoadingButton>
        </Stack>
      </Box>
    </>
  );
};
export default AddProjectForm;
