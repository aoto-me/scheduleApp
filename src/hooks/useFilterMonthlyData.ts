import { useMemo } from "react";
import { format } from "date-fns";
import { useCommonContext } from "../context/CommonContext";

// 特定の月のひと月分のデータを返す
const useFilterMonthlyData = <T extends { date: string }>(
  allData: T[],
  month: Date,
) => {
  const { currentMonth } = useCommonContext();
  const monthlyData = useMemo(
    () =>
      allData.filter((data) => data.date.startsWith(format(month, "yyyy-MM"))),
    [allData, currentMonth],
  );
  return monthlyData;
};

export default useFilterMonthlyData;
