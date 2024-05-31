import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  ListItemIcon,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { TodoSchema, todoSchema } from "../validations/sxhema";
import { TodoTypeIcons } from "./common/TodoIcons";
import { sendRequest } from "../utils/apiRequests";
import { Section, SendTodo, TimeTaken, Todo, TodoType } from "../types";
import { useTodoContext } from "../context/TodoContext";
import { useCommonContext } from "../context/CommonContext";
import { useProjectContext } from "../context/ProjectContext";

interface TodoFormProps {
  currentDay: string;
  type: "todo" | "task";
}

interface TypeItem {
  label: string;
  icon: JSX.Element;
}

const TodoForm = ({ currentDay, type }: TodoFormProps) => {
  const { isMobile, setIsDialogOpen, userId, csrfToken } = useCommonContext();
  const {
    todoData,
    setTodoData,
    timeTakenData,
    setTimeTakenData,
    selectedTodoData,
    setSelectedTodoData,
    selectedTimeTakenData,
  } = useTodoContext();
  const {
    projectData,
    sectionData,
    setIsFormOpen,
    selectedProjectData,
    selectedSectionData,
  } = useProjectContext();
  const [sectionOptions, setSectionOptions] = useState<Section[]>([]);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isDelLoading, setIsDelLoading] = useState(false);

  // TodoTypeIconsからタイプの選択肢を取得
  const todoTypes: TypeItem[] = Object.entries(TodoTypeIcons).map(
    ([label, icon]) => ({ label, icon }),
  );

  // ReactHookFormを使うための基本設定
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
    getValues,
    watch,
  } = useForm<TodoSchema>({
    defaultValues: {
      date: currentDay,
      time: "00:00:00",
      type: "",
      project: type === "task" ? selectedProjectData : null,
      section: type === "task" ? selectedSectionData : null,
      content: "",
      estimated: "00:00:00",
      completed: false,
      memo: "",
      timeTaken: [],
    },
    resolver: zodResolver(todoSchema),
    mode: "onChange",
  });

  // inputを動的に増減させるための設定
  const { fields, append, remove } = useFieldArray({
    control,
    name: "timeTaken",
  });

  // 現在のprojectを監視して、sectionの選択肢を変更する
  const currentProject = watch("project");
  useEffect(() => {
    if (!currentProject) {
      setSectionOptions([]);
      return;
    }
    const newSectionOptions = sectionData.filter(
      (section) => section.projectId === currentProject.id,
    );
    setSectionOptions(newSectionOptions);
  }, [currentProject]);

  // 新規データの保存処理
  const saveTodoData = async (data: SendTodo) => {
    setIsSaveLoading(true);
    const apiUrl = process.env.REACT_APP_TODO_API;
    const urlSearchParams = new URLSearchParams();
    Object.entries(data).forEach(([key, val]: [string, string | number]) => {
      if (Array.isArray(val)) {
        val.forEach((item, index) => {
          Object.entries(item as object).forEach(
            ([subKey, subVal]: [string, string]) => {
              urlSearchParams.append(
                `${key}[${index}][${subKey}]`,
                subVal.toString(),
              );
            },
          );
        });
      } else {
        urlSearchParams.append(key, val.toString());
      }
    });
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    urlSearchParams.append("action", "save");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      // TimeTakenの取得済みのデータを更新する
      if (data.timeTaken.length !== 0) {
        const newTimeTaken = data.timeTaken.map((item, index) => {
          if (response.timeTakenIds === undefined) {
            // 【WARNING】TypeScriptの都合でエラーが出るため、正規のreturnのオブジェクトと形を揃えたダミーの値を返す
            return {
              id: 0,
              todoId: 0,
              start: "00:00:00",
              end: "00:00:00",
            };
          }
          return {
            id: Number(response.timeTakenIds[index]),
            todoId: Number(response.id),
            start: `${data.date} ${item.start}`,
            end: `${data.date} ${item.end}`,
          } as TimeTaken;
        });
        if (Number(newTimeTaken[0].id) !== 0) {
          setTimeTakenData((prevTimeTaken) => [
            ...prevTimeTaken,
            ...newTimeTaken,
          ]);
        }
      }
      // TodoDataの取得済みのデータを更新する
      const newTodoData = {
        id: Number(response.id),
        date: data.date,
        time: data.time,
        type: data.type,
        projectId: data.projectId,
        sectionId: data.sectionId,
        sort: data.sort,
        content: data.content,
        estimated: data.estimated,
        completed: data.completed,
        memo: data.memo,
        dragType: "task",
      } as Todo;
      setTodoData((prevTodoData) => [...prevTodoData, newTodoData]);
      reset();
      // フォームを閉じる
      setIsFormOpen(false);
    }
    setIsSaveLoading(false);
  };

  // データ削除処理
  const deleteTodoData = async () => {
    if (!selectedTodoData) {
      return;
    }
    setIsDelLoading(true);
    const apiUrl = process.env.REACT_APP_DEL_API;
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append("id", selectedTodoData.id.toString());
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    urlSearchParams.append("tableType", "todo");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      // 取得済みのデータを更新する
      setTimeTakenData((prev) => {
        const newTimeTaken = prev.filter(
          (item) => item.todoId !== selectedTodoData.id,
        );
        return newTimeTaken;
      });
      setTodoData((prev) => {
        const newTodoData = prev.filter(
          (data) => data.id !== selectedTodoData.id,
        );
        return newTodoData;
      });
      // 選択を解除し、フォームを空にする
      reset();
      setSelectedTodoData(null);
      // フォームを閉じる
      setIsFormOpen(false);
      if (isMobile) {
        setIsDialogOpen(false);
      }
    }
    setIsDelLoading(false);
  };

  // 既存データの更新処理
  const updateTodoData = async (data: SendTodo) => {
    setIsSaveLoading(true);
    const apiUrl = process.env.REACT_APP_TODO_API;
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append("id", selectedTodoData?.id.toString() || "");
    Object.entries(data).forEach(([key, val]: [string, string | number]) => {
      if (Array.isArray(val)) {
        val.forEach((item, index) => {
          Object.entries(item as object).forEach(
            ([subKey, subVal]: [string, string]) => {
              urlSearchParams.append(
                `${key}[${index}][${subKey}]`,
                subVal.toString(),
              );
            },
          );
        });
      } else {
        urlSearchParams.append(key, val?.toString() || "");
      }
    });
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    urlSearchParams.append("action", "update");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      // TimeTakenのデータを更新する
      if (data.timeTaken.length !== 0) {
        const newTimeTaken = data.timeTaken.map((item, index) => {
          if (response.timeTakenIds === undefined) {
            // 【WARNING】TypeScriptの都合でエラーが出るため、正規のreturnのオブジェクトと形を揃えたダミーの値を返す
            return {
              id: 0,
              todoId: 0,
              start: "00:00:00",
              end: "00:00:00",
            };
          }
          return {
            id: Number(response.timeTakenIds[index]),
            todoId: Number(selectedTodoData?.id),
            start: `${data.date} ${item.start}`,
            end: `${data.date} ${item.end}`,
          } as TimeTaken;
        });
        const filteredTimeTaken = timeTakenData.filter(
          (item) => item.todoId !== selectedTodoData?.id,
        );
        if (Number(newTimeTaken[0].id) !== 0) {
          setTimeTakenData([...filteredTimeTaken, ...newTimeTaken]);
        }
      } else {
        const filteredTimeTaken = timeTakenData.filter(
          (item) => item.todoId !== selectedTodoData?.id,
        );
        setTimeTakenData([...filteredTimeTaken]);
      }
      // TodoDataの取得済みのデータを更新する
      const newTodoData = {
        id: Number(selectedTodoData?.id),
        date: data.date,
        time: data.time,
        type: data.type,
        projectId: data.projectId,
        sectionId: data.sectionId,
        sort: Number(selectedTodoData?.sort),
        content: data.content,
        estimated: data.estimated,
        completed: data.completed,
        memo: data.memo,
        dragType: "task",
      } as Todo;
      const newTodoDatas = todoData.map((prevTodoData) =>
        prevTodoData.id === selectedTodoData?.id
          ? { ...prevTodoData, ...newTodoData }
          : prevTodoData,
      );
      setTodoData(newTodoDatas);
      reset();
      setSelectedTodoData(null);
      // フォームを閉じる
      setIsFormOpen(false);
      if (isMobile) {
        setIsDialogOpen(false);
      }
    }
    setIsSaveLoading(false);
  };

  // フォームの送信処理
  const onSubmit: SubmitHandler<TodoSchema> = async (data) => {
    let newSection = 0;
    if (data.section !== null) {
      newSection =
        data.project?.id === data.section?.projectId ? data.section.id : 0;
    }
    let newSort = 0;
    // セクションが選択されていない場合は初期値のまま
    if (data.section !== null || newSection !== 0) {
      // プロジェクトIDと同じプロジェクト内のデータを取得
      const sameProjectData = todoData.filter(
        (todo) => todo.projectId === data.project?.id,
      );
      // 既存データが存在しない場合、同プロジェクト内でのsortの最大値を取得
      if (!selectedTodoData) {
        newSort = sameProjectData.length;
      } else if (selectedTodoData.sectionId === data.section?.id) {
        // 既存データのセクションIDと同じ場合は既存データのsortを使用
        newSort = selectedTodoData.sort;
      } else {
        // 既存データのセクションIDと異なる場合は同プロジェクト内でのsortの最大値を取得
        newSort = sameProjectData.length;
      }
    }
    // Form専用のTodo型のオブジェクトを作成
    const sendData: SendTodo = {
      date: data.date,
      time: data.time,
      type: data.type as TodoType,
      projectId: data.project === null ? 0 : data.project.id,
      sectionId: data.section === null ? 0 : newSection,
      sort: newSort,
      content: data.content,
      estimated: data.estimated,
      completed: data.completed ? 1 : 0,
      memo: data.memo,
      timeTaken: data.timeTaken,
    };
    if (selectedTodoData) {
      await updateTodoData(sendData);
    } else {
      await saveTodoData(sendData);
    }
  };

  // 取引が選択された場合にフォームにデータをセット
  useEffect(() => {
    if (selectedTodoData) {
      // 新しいデータをセット
      setValue("date", selectedTodoData.date);
      setValue("time", selectedTodoData.time);
      setValue("type", selectedTodoData.type);
      setValue(
        "project",
        projectData.find(
          (project) => project.id === selectedTodoData.projectId,
        ) || null,
      );
      setValue(
        "section",
        sectionData.find(
          (section) => section.id === selectedTodoData.sectionId,
        ) || null,
      );
      setValue("content", selectedTodoData.content);
      setValue("estimated", selectedTodoData.estimated);
      setValue("completed", Boolean(selectedTodoData.completed));
      setValue("memo", selectedTodoData.memo);
      setValue(
        "timeTaken",
        selectedTimeTakenData.map((data) => ({
          start: format(data.start, "HH:mm"),
          end: format(data.end, "HH:mm"),
        })),
      );
    } else {
      reset({
        date: currentDay,
        time: "00:00:00",
        type: "",
        project: type === "task" ? selectedProjectData : null,
        section: type === "task" ? selectedSectionData : null,
        content: "",
        estimated: "00:00:00",
        completed: false,
        memo: "",
        timeTaken: [],
      });
    }
  }, [selectedTodoData, selectedTimeTakenData, currentDay]);

  useEffect(() => {
    reset({
      ...getValues(), // 現在のフォームの値を取得
      timeTaken: selectedTimeTakenData.map((data) => ({
        start: format(data.start, "HH:mm"),
        end: format(data.end, "HH:mm"),
      })),
    });
  }, [selectedTimeTakenData, reset]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2}>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              required
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
          name="time"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="時間"
              type="time"
              InputLabelProps={{
                shrink: true,
              }}
              error={!!errors.time}
              helperText={errors.time?.message}
            />
          )}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <TextField
              required
              error={!!errors.type}
              helperText={errors.type?.message}
              {...field}
              label="タイプ"
              select
              InputLabelProps={{
                htmlFor: "type",
              }}
              inputProps={{ id: "type" }}
            >
              {todoTypes.map((todoType, index) => (
                <MenuItem key={index} value={todoType.label}>
                  <ListItemIcon sx={{ verticalAlign: "text-bottom" }}>
                    {todoType.icon}
                  </ListItemIcon>
                  {todoType.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <TextField
              required
              error={!!errors.content}
              helperText={errors.content?.message}
              {...field}
              label="内容"
              type="text"
            />
          )}
        />

        <Controller
          name="project"
          control={control}
          render={({ field }) => (
            <Autocomplete
              disablePortal
              id="project"
              options={projectData}
              getOptionLabel={(option) => option.name}
              onChange={(event, newValue) => {
                if (newValue === null) {
                  field.onChange(null);
                  setValue("project", null);
                } else {
                  field.onChange(newValue);
                  setValue("project", newValue);
                }
              }}
              noOptionsText="プロジェクトが見つかりません"
              value={
                projectData.find((option) => option.id === field.value?.id) ||
                null
              }
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="プロジェクト"
                  error={!!errors.project}
                  helperText={errors.project?.message}
                  // {...field}
                />
              )}
            />
          )}
        />

        <Controller
          name="section"
          control={control}
          render={({ field }) => (
            <Autocomplete
              disablePortal
              id="section"
              options={sectionOptions}
              getOptionLabel={(option) => option.name}
              onChange={(event, newValue) => {
                if (newValue === null) {
                  field.onChange(null);
                  setValue("section", null);
                } else {
                  field.onChange(newValue);
                  setValue("section", newValue);
                }
              }}
              noOptionsText="セクションがありません"
              value={
                sectionOptions.find(
                  (option) => option.id === field.value?.id,
                ) || null
              }
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="セクション"
                  error={!!errors.section}
                  helperText={errors.section?.message}
                  // {...field}
                />
              )}
            />
          )}
        />

        <Controller
          name="estimated"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="作業見積"
              type="time"
              InputLabelProps={{
                shrink: true,
              }}
              error={!!errors.estimated}
              helperText={errors.estimated?.message}
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
        {fields.map((fieldItem, index) => (
          <Grid
            key={index}
            container
            spacing={0}
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={5}>
              <Controller
                name={`timeTaken.${index}.start`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="作業開始時間"
                    type="time"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={5}>
              <Controller
                name={`timeTaken.${index}.end`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="作業終了時間"
                    type="time"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={1}>
              <IconButton
                aria-label="delete"
                size="small"
                onClick={() => {
                  remove(index);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        ))}
        <Button
          startIcon={<AddCircleIcon />}
          color="primary"
          onClick={() => {
            append({ start: "00:00", end: "00:00" });
          }}
          variant="outlined"
        >
          作業時間を追加
        </Button>
        <Controller
          name="completed"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              {...field}
              control={<Checkbox />}
              label="完了"
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
          {isSaveLoading ? "　" : selectedTodoData ? "更新" : "保存"}
        </LoadingButton>
        {selectedTodoData && (
          <LoadingButton
            onClick={deleteTodoData}
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
export default TodoForm;
