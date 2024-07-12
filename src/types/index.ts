export type FormType = "todo" | "money" | "health" | "none";
export type ProjectFormType = "add" | "section" | "task" | "none";

export interface ResponseData {
  success: boolean;
  error?: string;
  id?: number;
  ids?: number[];
  timeTakenIds?: number[];
}

// Money
export type MoneyType = "収入" | "支出";
export type IncomeCategory = "給与" | "副収入" | "その他";
export type ExpenseCategory =
  | "食費"
  | "日用品"
  | "住宅費"
  | "お菓子"
  | "交通費"
  | "交際費"
  | "娯楽"
  | "美容"
  | "月契約"
  | "保険"
  | "医療"
  | "その他";
export interface Money {
  id: number;
  date: string;
  type: MoneyType;
  category: IncomeCategory | ExpenseCategory;
  amount: number;
  content: string;
}
export interface Balance {
  income: number;
  expense: number;
  balance: number;
}

// ToDo
export type TodoType = "仕事" | "プライベート" | "ルーティン";
export interface Todo {
  id: number;
  date: string;
  time: string;
  type: TodoType;
  projectId: number;
  sectionId: number;
  sort: number;
  content: string;
  estimated: string;
  completed: 0 | 1;
  memo: string;
  dragType: "task";
}

export interface SendTodo extends Omit<Todo, "id" | "dragType"> {
  timeTaken: { start: string; end: string }[];
}

export interface TimeTaken {
  id: number;
  todoId: number;
  start: string;
  end: string;
}

export interface MonthlyMemo {
  id: number;
  date: string;
  memo: string;
}

// Project
export interface Project {
  id: number;
  name: string;
  end: string;
  completed: 0 | 1;
  memo: string;
}
export interface SendProject extends Omit<Project, "id"> {}

export interface Section {
  id: number;
  projectId: number;
  name: string;
  sort: number;
  memo: string;
  dragType: "section";
}
export interface SendSection extends Omit<Section, "id" | "dragType"> {}

// Health
export interface Health {
  id: number;
  date: string;
  upTime: string;
  bedTime: string;
  body: string;
  headache: 0 | 1;
  stomach: 0 | 1;
  period: 0 | 1;
  sleepless: 0 | 1;
  cold: 0 | 1;
  nausea: 0 | 1;
  hayfever: 0 | 1;
  depression: 0 | 1;
  tired: 0 | 1;
  other: 0 | 1;
  memo: string;
}

// Calendar
export interface CalendarMoneyEvent {
  start: string;
  income: string;
  expense: string;
  balance: string;
}
export interface CalendarTodoEvent {
  title: string;
  start: string;
  classNames: string;
}
export interface CalendarHealthEvent {
  start: string;
  classNames: string;
  headache: 0 | 1;
  stomach: 0 | 1;
  period: 0 | 1;
  sleepless: 0 | 1;
  cold: 0 | 1;
  nausea: 0 | 1;
  hayfever: 0 | 1;
  depression: 0 | 1;
  tired: 0 | 1;
  other: 0 | 1;
}
export interface Holiday {
  title: string;
  start: string;
  classNames: string;
}

// kanbanBoard
export type TaskDragHandler = (
  dragIndex: number,
  targetIndex: number,
  sectionId: number,
) => void;

export type SectionWithIndex = Section & { index: number };
export type TaskWithIndex = Todo & { index: number };

// memo
export interface Memo {
  id: number;
  name: string;
  memo: string;
  sort: number;
}
export interface SendMemo extends Omit<Memo, "id"> {}
