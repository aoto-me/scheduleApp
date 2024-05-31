import { addDays, format } from "date-fns";
import { useMemo } from "react";

// 渡された日付とその前日のデータを返す
const useFilterTodayAndYesterdayData = <T extends { date: string }>(
  allData: T[],
  currentDay: string,
) => {
  const TodayAndYesterdayData = useMemo(() => {
    const sortedData = [...allData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const todayIndex = sortedData.findIndex((data) => data.date === currentDay);
    const today = sortedData[todayIndex];
    if (!today) return { today: undefined, yesterday: undefined }; // todayがない場合は両方undefinedを返す
    if (todayIndex === 0) return { today: { ...today }, yesterday: undefined }; // todayが0番目の場合はtodayだけ格納して返す
    const yesterday =
      sortedData[todayIndex - 1].date ===
      format(addDays(currentDay, -1), "yyyy-MM-dd")
        ? sortedData[todayIndex - 1]
        : undefined;
    return {
      today: today ? { ...today } : undefined,
      yesterday: yesterday ? { ...yesterday } : undefined,
    };
  }, [allData, currentDay]);

  return TodayAndYesterdayData;
};

export default useFilterTodayAndYesterdayData;
