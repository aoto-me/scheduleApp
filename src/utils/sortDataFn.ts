import { compareDesc, parseISO } from "date-fns";

// 日付の降順でデータをソートする
export const sortDataByDate = <T>(data: T[], dateField: keyof T): T[] =>
  [...data].sort((a, b) =>
    compareDesc(
      parseISO(a[dateField] as string),
      parseISO(b[dateField] as string),
    ),
  );
