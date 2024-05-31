import { useMemo } from "react";
import { endOfMonth, format, subMonths } from "date-fns";
import { useCommonContext } from "../context/CommonContext";

// currentMonthのひと月分のデータ+先月末のデータを取得
const useFilterCurrentMonthAndLastDayOfLastMonthData = <
  T extends { date: string },
>(
  allData: T[],
) => {
  const { currentMonth } = useCommonContext();
  const currentMonthAndLastDayOfLastMonthData = useMemo(() => {
    const lastDayOfLastMonth = endOfMonth(subMonths(currentMonth, 1));
    const formattedLastDayOfLastMonth = format(
      lastDayOfLastMonth,
      "yyyy-MM-dd",
    );
    const formattedCurrentMonth = format(currentMonth, "yyyy-MM");
    const lastDayOfLastMonthData = allData.filter(
      (data) => data.date === formattedLastDayOfLastMonth,
    );
    const currentMonthData = allData.filter((data) =>
      data.date.startsWith(formattedCurrentMonth),
    );
    return [...lastDayOfLastMonthData, ...currentMonthData];
  }, [allData, currentMonth]);
  return currentMonthAndLastDayOfLastMonthData;
};

export default useFilterCurrentMonthAndLastDayOfLastMonthData;
