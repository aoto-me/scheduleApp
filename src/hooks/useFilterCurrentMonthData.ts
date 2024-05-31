import { useMemo } from "react";
import { format } from "date-fns";
import { useCommonContext } from "../context/CommonContext";

// currentMonthのひと月分のデータのみ取得
const useFilterCurrentMonthData = <T extends { date: string }>(
  allData: T[],
) => {
  const { currentMonth } = useCommonContext();
  const currentMonthData = useMemo(
    () =>
      allData.filter((data) =>
        data.date.startsWith(format(currentMonth, "yyyy-MM")),
      ),
    [allData, currentMonth],
  );
  return currentMonthData;
};

export default useFilterCurrentMonthData;
