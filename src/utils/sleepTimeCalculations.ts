import { addDays, format } from "date-fns";
import { Health } from "../types";

// 睡眠時間を計算する
export const calculateSleepTime = (
  data: Health[],
  isMonthly: boolean = false, // 月の表記が必要かどうか
): { date: string; sleepTime: number }[] => {
  const sleepTimeData: { date: string; sleepTime: number }[] = [];
  // 日付順にソート
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  // 0番目のデータは前日のデータがないため、計算できないから1番目から処理を開始
  for (let i = 1; i < sortedData.length; i += 1) {
    if (sortedData[i - 1]) {
      const yesterdayData =
        sortedData[i - 1].date ===
        format(addDays(sortedData[i].date, -1), "yyyy-MM-dd")
          ? sortedData[i - 1]
          : undefined;
      if (
        yesterdayData !== undefined &&
        !yesterdayData.bedTime.includes("00:00:00") &&
        !sortedData[i].upTime.includes("00:00:00")
      ) {
        const startTime = new Date(yesterdayData.bedTime);
        const endTime = new Date(sortedData[i].upTime);
        const diffMs = endTime.getTime() - startTime.getTime();
        // ミリ秒を時間に変換
        let hours = diffMs / (1000 * 60 * 60);
        // 小数点第2位まで丸める
        hours = Math.round(hours * 100) / 100;

        sleepTimeData.push({
          date: isMonthly
            ? sortedData[i].date
            : format(new Date(sortedData[i].date), "d日"),
          sleepTime: isMonthly ? diffMs : hours,
        });
      }
    }
  }
  return sleepTimeData;
};

// 平均睡眠時間を計算
export const calculateAverageSleepTime = (
  sleepData: { date: string; sleepTime: number }[],
) => {
  // 睡眠時間の合計を計算
  const totalSleepTime = sleepData.reduce(
    (accumulator, currentValue) => accumulator + currentValue.sleepTime,
    0,
  );

  // データの長さを取得して、平均睡眠時間を計算
  const averageSleepTimeMs = totalSleepTime / sleepData.length || 0;

  // 分と時間に変換
  const averageHours = Math.floor(averageSleepTimeMs / 3600000) || 0;
  const averageMinutes =
    Math.round((averageSleepTimeMs % 3600000) / 60000) || 0;

  // ミリ秒を時間に変換(時間のみでの換算)
  let hoursOnly = averageSleepTimeMs / (1000 * 60 * 60);
  // 小数点第2位まで丸める
  hoursOnly = Math.round(hoursOnly * 100) / 100;

  return {
    hour: averageHours,
    minute: averageMinutes,
    ms: averageSleepTimeMs,
    hours: hoursOnly,
  };
};
