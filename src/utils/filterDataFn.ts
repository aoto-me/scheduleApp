import { format } from "date-fns";

// ひと月分のデータのみ取得
export const filterMonthlyData = <T extends { date: string }>(
  allData: T[],
  month: Date,
): T[] =>
  allData.filter((data) => data.date.startsWith(format(month, "yyyy-MM")));

// 1年分のデータのみ取得
export const filterYearData = <T extends { date: string }>(
  allData: T[],
  year: Date,
): T[] => allData.filter((data) => data.date.startsWith(format(year, "yyyy")));

// 共通の検索フィルタ関数の定義
export const filterDataBySearchWords = <T>(
  data: T[],
  searchWords: string[],
  contentField: keyof T,
  useEvery: boolean = false, // デフォルトはsomeを使用
): T[] =>
  data.filter((item) => {
    const content = item[contentField] as unknown as string;
    return useEvery
      ? searchWords.every((word) => content.includes(word))
      : searchWords.some((word) => content.includes(word));
  });
