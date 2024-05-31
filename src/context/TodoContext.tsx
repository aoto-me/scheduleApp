import { createContext, useContext, useState } from "react";
import { MonthlyMemo, TimeTaken, Todo } from "../types";

interface TodoContextType {
  todoData: Todo[];
  setTodoData: React.Dispatch<React.SetStateAction<Todo[]>>;
  selectedTodoData: Todo | null;
  setSelectedTodoData: React.Dispatch<React.SetStateAction<Todo | null>>;
  timeTakenData: TimeTaken[];
  setTimeTakenData: React.Dispatch<React.SetStateAction<TimeTaken[]>>;
  selectedTimeTakenData: TimeTaken[];
  setSelectedTimeTakenData: React.Dispatch<React.SetStateAction<TimeTaken[]>>;
  isTodoLoading: boolean;
  setIsTodoLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isTimeTakenLoading: boolean;
  setIsTimeTakenLoading: React.Dispatch<React.SetStateAction<boolean>>;
  monthlyMemoData: MonthlyMemo[];
  setMonthlyMemoData: React.Dispatch<React.SetStateAction<MonthlyMemo[]>>;
  isMonthlyMemoLoading: boolean;
  setIsMonthlyMemoLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TodoContext = createContext<TodoContextType | undefined>(
  undefined,
);

export const TodoContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [todoData, setTodoData] = useState<Todo[]>([]);
  const [selectedTodoData, setSelectedTodoData] = useState<Todo | null>(null);
  const [timeTakenData, setTimeTakenData] = useState<TimeTaken[]>([]);
  const [selectedTimeTakenData, setSelectedTimeTakenData] = useState<
    TimeTaken[]
  >([]);
  const [isTodoLoading, setIsTodoLoading] = useState(true);
  const [isTimeTakenLoading, setIsTimeTakenLoading] = useState(true);
  const [monthlyMemoData, setMonthlyMemoData] = useState<MonthlyMemo[]>([]);
  const [isMonthlyMemoLoading, setIsMonthlyMemoLoading] = useState(true);

  return (
    <TodoContext.Provider
      value={{
        todoData,
        setTodoData,
        selectedTodoData,
        setSelectedTodoData,
        timeTakenData,
        setTimeTakenData,
        selectedTimeTakenData,
        setSelectedTimeTakenData,
        isTodoLoading,
        setIsTodoLoading,
        isTimeTakenLoading,
        setIsTimeTakenLoading,
        monthlyMemoData,
        setMonthlyMemoData,
        isMonthlyMemoLoading,
        setIsMonthlyMemoLoading,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodoContext = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error("TodoContextをプロバイダーの中で取得してください");
  }
  return context;
};
