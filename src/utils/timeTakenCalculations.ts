import { TimeTaken } from "../types";

// 渡されたTimeTakenの作業時間の合計時間を計算する関数
export function calculateTotalTimeTaken(
  timeTakens: TimeTaken[],
  date: string,
): {
  hours: number;
  minutes: number;
  ms: number;
} {
  let totalMilliseconds = 0;
  timeTakens.forEach((data) => {
    const { start, end } = data;
    if (end !== `${date} 00:00:00` && end !== `${date} 00:00`) {
      const startDateTime = new Date(start);
      const endDateTime = new Date(end);
      const timeDiff = endDateTime.getTime() - startDateTime.getTime();
      totalMilliseconds += timeDiff;
    }
  });
  const hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
  const remainingMilliseconds = totalMilliseconds % (1000 * 60 * 60);
  const minutes = Math.round(remainingMilliseconds / (1000 * 60));
  return { hours, minutes, ms: totalMilliseconds };
}
