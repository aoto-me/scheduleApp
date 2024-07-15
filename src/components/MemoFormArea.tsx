import React, { useState } from "react";
import {
  Box,
  IconButton,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogContent,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCommonContext } from "../context/CommonContext";
import { memoSchema, MemoSchema } from "../validations/sxhema";
import { sendRequest } from "../utils/apiRequests";
import { Memo, SendMemo } from "../types";
import { useMemoContext } from "../context/MemoContext";
import { base64Encode } from "../utils/formatting";

const AddMemoForm = () => {
  const { userId, csrfToken } = useCommonContext();
  const { setMemoData, handleFormClose } = useMemoContext();
  const [isSaveLoading, setIsSaveLoading] = useState(false);

  // react-hook-formの初期値
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<MemoSchema>({
    defaultValues: {
      name: "",
      memo: "",
    },
    resolver: zodResolver(memoSchema),
  });

  // 新規データの保存処理
  const saveMemoData = async (data: SendMemo) => {
    setIsSaveLoading(true);
    const apiUrl = process.env.REACT_APP_MEMO_API;
    const urlSearchParams = new URLSearchParams();
    Object.keys(data).forEach((key) => {
      const val = data[key as keyof SendMemo];
      urlSearchParams.append(
        key,
        key === "memo"
          ? base64Encode(val.toString()) || ""
          : val?.toString() || "",
      );
    });
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    urlSearchParams.append("action", "save");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      // MemoDataの取得済みのデータを更新する
      const newMemoData = {
        id: Number(response.id),
        name: data.name,
        memo: data.memo,
      } as Memo;
      setMemoData((prevMemoData) => [...prevMemoData, newMemoData]);
      // フォームを閉じる
      reset();
      handleFormClose();
    }
    setIsSaveLoading(false);
  };

  // フォームの送信処理
  const onSubmit: SubmitHandler<MemoSchema> = async (data) => {
    // Form専用のMemo型のオブジェクトを作成
    const sendData: SendMemo = {
      name: data.name,
      memo: data.memo,
      sort: 0,
    };
    await saveMemoData(sendData);
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
          メモの追加
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
                label="メモ名"
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
            {isSaveLoading ? "　" : "保存"}
          </LoadingButton>
        </Stack>
      </Box>
    </>
  );
};

const MemoFormArea = () => {
  const { isFormOpen, handleFormClose } = useMemoContext();

  return (
    <Dialog
      maxWidth={"sm"}
      fullWidth
      open={isFormOpen}
      onClose={handleFormClose}
      sx={{
        "& .MuiDialog-paper": {
          margin: "2rem auto",
          width: "calc(100% - 2rem)",
        },
      }}
    >
      <DialogContent
        sx={{
          p: "1.25rem min(4vw,1.5rem) 1.75rem min(4vw,1.5rem)",
        }}
      >
        <AddMemoForm />
      </DialogContent>
    </Dialog>
  );
};
export default MemoFormArea;
