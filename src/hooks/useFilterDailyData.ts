import { useMemo } from "react";

// 渡された日付のデータを返す
const useFilterDailyData = <T extends { date: string }>(
  monthlyData: T[],
  currentDay: string,
) => {
  const dailyData = useMemo(
    () => monthlyData.filter((data) => data.date === currentDay),
    [monthlyData, currentDay],
  );
  return dailyData;
};

export default useFilterDailyData;
