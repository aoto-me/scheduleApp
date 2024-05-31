import React, { useState } from "react";
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { CSSProperties } from "@mui/material/styles/createMixins";
import AccessTimeSharpIcon from "@mui/icons-material/AccessTimeSharp";
import DeleteSharpIcon from "@mui/icons-material/DeleteSharp";
import EditSharpIcon from "@mui/icons-material/EditSharp";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import "../styles/Markdown.css";
import { format } from "date-fns";
import { sendRequest } from "../utils/apiRequests";
import KanbanBoard from "./KanbanBoard";
import { useCommonContext } from "../context/CommonContext";
import { useProjectContext } from "../context/ProjectContext";
import { useTodoContext } from "../context/TodoContext";
import ProjectBarChart from "./ProjectBarChart";

const fontSerif: CSSProperties = {
  fontFamily:
    "'Zen Old Mincho', 'Times New Roman', 'ヒラギノ明朝 ProN','Hiragino Mincho ProN', 'Yu Mincho', 'YuMincho', 'Yu Mincho', '游明朝体','ＭＳ 明朝', 'MS Mincho', serif !important",
};

const useProjectUpdate = () => {
  const { userId, csrfToken } = useCommonContext();
  const { projectData, setProjectData, selectedProjectData } =
    useProjectContext();

  const updateProject = async (type: string, value: string | number) => {
    const apiUrl = process.env.REACT_APP_PROJECT_API;
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append("id", selectedProjectData?.id.toString() || "");
    urlSearchParams.append("type", type);
    urlSearchParams.append(type, value.toString());
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    urlSearchParams.append("action", "update");
    const response = await sendRequest(apiUrl, urlSearchParams);
    if (response) {
      // 取得済みProjectのデータを更新
      const newProjectData = projectData.map((prevProjectData) =>
        prevProjectData.id === selectedProjectData?.id
          ? { ...prevProjectData, [type]: value }
          : prevProjectData,
      );
      setProjectData(newProjectData);
    }
  };
  return updateProject;
};

function ProjectContent() {
  const theme = useTheme();
  const [nameState, setNameState] = useState(false);
  const [endState, setEndState] = useState(false);
  const [memoState, setMemoState] = useState(false);
  const { userId, isMobile, csrfToken } = useCommonContext();
  const {
    projectData,
    setProjectData,
    selectedProjectData,
    setSelectedProjectData,
    sectionData,
    setSectionData,
  } = useProjectContext();
  const { todoData, setTodoData } = useTodoContext();

  const updateProject = useProjectUpdate();

  // プロジェクト名を更新
  const projectNameUpdate = async (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
  ) => {
    if (e.target.value === "" || e.target.value === selectedProjectData?.name) {
      setNameState(false);
      return;
    }
    await updateProject("name", e.target.value);
    setNameState(false);
  };

  // 期限を更新
  const projectEndUpdate = async (
    e:
      | React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (e.target.value === selectedProjectData?.end) {
      setEndState(false);
      return;
    }
    await updateProject("end", e.target.value);
    setEndState(false);
  };

  // 完了状態を更新
  const projectCompletedUpdate = async (e: React.SyntheticEvent) => {
    // 【MEMO】'checked' はタイプ 'EventTarget' に存在しませんというエラーが出るため対応
    // 参考：https://stackoverflow.com/questions/66965210/property-checked-does-not-exist-on-type-eventtarget-ts2339-angular/66965393
    const $target = e.target as HTMLInputElement;
    const ischecked = `${$target.checked}`; // true or false or undefined が文字列で返る
    if (ischecked === undefined || ischecked === "undefined") {
      return;
    }
    const newCompleted = ischecked === "true" ? 1 : 0;
    await updateProject("completed", newCompleted);
  };

  // メモを更新
  const projectMemoUpdate = async (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
  ) => {
    if (e.target.value === selectedProjectData?.memo) {
      setMemoState(false);
      return;
    }
    await updateProject("memo", e.target.value);
    setMemoState(false);
  };

  // プロジェクトを削除
  const handleDelProject = async () => {
    // ダイアログを表示してユーザーに確認を求める
    const userConfirmed = window.confirm(
      "プロジェクトを削除してもよろしいですか？",
    );
    if (userConfirmed) {
      // プロジェクトを削除
      const apiUrl = process.env.REACT_APP_DEL_API;
      const urlSearchParams = new URLSearchParams();
      urlSearchParams.append("id", selectedProjectData?.id.toString() || "");
      urlSearchParams.append("userId", userId);
      urlSearchParams.append("csrfToken", csrfToken);
      urlSearchParams.append("tableType", "project");
      const response = await sendRequest(apiUrl, urlSearchParams);
      if (response) {
        // 取得済みProjectのデータを更新
        const newProjectData = projectData.filter(
          (prevProjectData) => prevProjectData.id !== selectedProjectData?.id,
        );
        // 取得済みSectionのデータを更新
        const newSectionData = sectionData.filter(
          (prevSectionData) =>
            prevSectionData.projectId !== selectedProjectData?.id,
        );
        // 取得済みのTodoのデータを更新
        const newTodoData = todoData.map((prevTodoData) => {
          if (prevTodoData.projectId === selectedProjectData?.id) {
            return {
              ...prevTodoData,
              projectId: 0,
              sectionId: 0,
              sort: 0,
            };
          }
          // 条件に一致しない場合は元のデータをそのまま返す
          return prevTodoData;
        });
        setSelectedProjectData(null);
        setProjectData(newProjectData);
        setSectionData(newSectionData);
        setTodoData(newTodoData);
      }
    }
  };

  return (
    <Box
      sx={{
        p: "2.5rem min(4vw, 1.5rem) 2rem",
        flexGrow: 1,
        width: `${isMobile ? "100%" : "calc(100% - 220px)"}`,
      }}
    >
      <Stack spacing={1}>
        {/* プロジェクト名 */}
        <Box>
          {nameState ? (
            <TextField
              fullWidth
              multiline
              autoComplete="off"
              hiddenLabel
              id="name"
              variant="outlined"
              className="font-serif"
              defaultValue={selectedProjectData?.name}
              onBlur={(e) => projectNameUpdate(e)}
              autoFocus
              sx={{
                backgroundColor: "transparent",
                "& .MuiInputBase-root": {
                  padding: 0,
                  backgroundColor: "transparent",
                },
                "& .MuiInputBase-input": {
                  ...fontSerif,
                  fontWeight: 700,
                  lineHeight: 1.35,
                  fontSize: "clamp(1.85rem, 7vw, 2.5rem)",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none !important",
                },
              }}
            />
          ) : (
            <Typography
              component={"h2"}
              onClick={() => setNameState(true)}
              fontWeight={700}
              className="font-serif"
              sx={{
                lineHeight: 1.35,
                fontSize: "clamp(1.85rem, 7vw, 2.5rem)",
              }}
            >
              {selectedProjectData?.name}
            </Typography>
          )}
        </Box>
        {/* 期限・終了 */}
        <Box
          display="flex"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box mr={3}>
            <AccessTimeSharpIcon
              color="primary"
              sx={{ verticalAlign: "bottom" }}
            />
            {endState ? (
              <TextField
                autoFocus
                autoComplete="off"
                onBlur={(e) => projectEndUpdate(e)}
                onChange={(e) => projectEndUpdate(e)}
                defaultValue={
                  selectedProjectData?.end === "0000-00-00"
                    ? ""
                    : selectedProjectData?.end
                }
                variant="outlined"
                id="end"
                type="date"
                sx={{
                  marginLeft: 1,
                  width: "120px",
                  "& .MuiInputBase-root": {
                    padding: 0,
                    backgroundColor: "transparent",
                  },
                  "& .MuiInputBase-input": {
                    padding: 0,
                    lineHeight: 1.35,
                    letterSpacing: "0.025em",
                    fontSize: "1rem",
                    fontWeight: 700,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "& .MuiInputAdornment-root": {
                    ml: 0,
                  },
                }}
              />
            ) : (
              <Typography
                onClick={() => setEndState(true)}
                component={"span"}
                variant="body1"
                fontWeight={700}
                sx={{
                  display: "inline-block",
                  width: "120px",
                  letterSpacing: "0.05em",
                  marginLeft: 1,
                  lineHeight: 1.35,
                }}
              >
                {selectedProjectData?.end === "0000-00-00"
                  ? "----/--/--"
                  : format(
                      selectedProjectData?.end || "0000-00-00",
                      "yyyy/MM/dd",
                    )}
              </Typography>
            )}
          </Box>
          <FormGroup sx={{ flexShrink: 0 }}>
            <FormControlLabel
              checked={Boolean(selectedProjectData?.completed === 1)}
              onClick={(e) => projectCompletedUpdate(e)}
              control={<Checkbox />}
              label="終了"
              sx={{
                "& .MuiTypography-root": {
                  fontWeight: 700,
                },
              }}
            />
          </FormGroup>
          <IconButton
            aria-label="delete"
            sx={{ ml: "auto" }}
            onClick={handleDelProject}
          >
            <DeleteSharpIcon sx={{ opacity: 0.5 }} />
          </IconButton>
        </Box>
      </Stack>
      {/* カンバンボード */}
      <KanbanBoard />
      {/* グラフ */}
      <ProjectBarChart />
      {/* メモ */}
      <Box display="flex" alignItems="center" mt={4.5}>
        <Typography
          component={"h3"}
          variant="h5"
          className="font-serif"
          sx={{
            pr: 1.5,
            fontWeight: 700,
          }}
        >
          Memo
        </Typography>
        <Divider
          sx={{ flexGrow: 1, borderColor: theme.palette.text.primary }}
        />
      </Box>
      <Box className="contentBox" sx={{ mt: 2 }}>
        {memoState && (
          <TextField
            fullWidth
            multiline
            autoComplete="off"
            hiddenLabel
            id="memo"
            variant="outlined"
            defaultValue={selectedProjectData?.memo}
            onBlur={(e) => projectMemoUpdate(e)}
            autoFocus
            sx={{
              p: "min(4vw,1.5rem)",
              fontSize: { xs: "0.85rem", md: "1rem" },
              backgroundColor: "transparent",
              "& .MuiInputBase-root": {
                padding: 0,
                backgroundColor: "transparent",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none !important",
              },
            }}
          />
        )}
        {selectedProjectData?.memo !== "" && memoState === false && (
          <Box
            p="min(4vw,1.5rem) clamp(2rem, 7vw, 3rem) min(4vw,1.5rem) min(4vw,1.5rem)"
            className="markdown"
            sx={{
              position: "relative",
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {selectedProjectData?.memo}
            </ReactMarkdown>
            <IconButton
              aria-label="メモを編集する"
              size="small"
              color="secondary"
              sx={{
                position: "absolute",
                top: "min(4vw,20px)",
                right: "min(1.5vw, 12px)",
                borderRadius: "4px",
              }}
              onClick={() => setMemoState(true)}
            >
              <EditSharpIcon
                sx={{ fontSize: "clamp(0.85rem, 3vw, 1.25rem)" }}
              />
            </IconButton>
          </Box>
        )}
        {selectedProjectData?.memo === "" && memoState === false && (
          <Box
            onClick={() => setMemoState(true)}
            p={2}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            sx={{
              "&& > *:first-of-type": {
                marginTop: 0,
              },
              "&& > *:last-child": {
                marginBottom: 0,
              },
              "&& > p": {
                textAlign: "center",
              },
            }}
          >
            <EditSharpIcon color="secondary" fontSize="small" sx={{ mr: 1 }} />
            <Typography
              component={"span"}
              variant="body1"
              color="textSecondary"
            >
              メモを記載する
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ProjectContent;
