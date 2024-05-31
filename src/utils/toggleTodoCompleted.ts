import axios from "axios";
import { useCommonContext } from "../context/CommonContext";
import { useTodoContext } from "../context/TodoContext";
import { ResponseData, Todo } from "../types";

// todoのcompletedを更新する
export const useToggleTodoCompleted = () => {
  const { userId, csrfToken } = useCommonContext();
  const { todoData, setTodoData } = useTodoContext();

  const toggleTodoCompleted = (data: Todo) => {
    const newCompleted = Number(data.completed) === 0 ? 1 : 0;
    const apiUrl = process.env.REACT_APP_COMPLETED_API;
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append("id", data.id.toString());
    urlSearchParams.append("completed", newCompleted.toString());
    urlSearchParams.append("userId", userId);
    urlSearchParams.append("csrfToken", csrfToken);
    if (!apiUrl) {
      console.error("APIが設定されていません");
      return;
    }
    axios
      .post<ResponseData>(apiUrl, urlSearchParams)
      .then((response) => {
        // 通信成功
        if (response.data.success) {
          // TodoDataの取得済みのデータを更新する
          const newTodoData = todoData.map((prevTodoData) =>
            prevTodoData.id === data.id
              ? { ...prevTodoData, completed: newCompleted }
              : prevTodoData,
          );
          setTodoData(newTodoData as Todo[]);
        } else {
          console.error(response.data.error);
        }
      })
      .catch((error) => {
        // 通信失敗
        console.error(error);
      });
  };
  return toggleTodoCompleted;
};
