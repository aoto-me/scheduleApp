import { useMemo } from "react";
import { endOfMonth, format, subMonths } from "date-fns";
import { useCommonContext } from "../context/CommonContext";

// ひと月分のデータ+先月末のデータを取得
const useFilterMonthAndLastDayOfLastMonthData = <T extends { date: string }>(
  allData: T[],
  month: Date,
) => {
  const { currentMonth } = useCommonContext();
  const monthAndLastDayOfLastMonthData = useMemo(() => {
    const lastDayOfLastMonth = endOfMonth(subMonths(month, 1));
    const formattedLastDayOfLastMonth = format(
      lastDayOfLastMonth,
      "yyyy-MM-dd",
    );
    const formattedCurrentMonth = format(month, "yyyy-MM");
    const lastDayOfLastMonthData = allData.filter(
      (data) => data.date === formattedLastDayOfLastMonth,
    );
    const monthData = allData.filter((data) =>
      data.date.startsWith(formattedCurrentMonth),
    );
    return [...lastDayOfLastMonthData, ...monthData];
  }, [allData, currentMonth]);
  return monthAndLastDayOfLastMonthData;
};

export default useFilterMonthAndLastDayOfLastMonthData;
