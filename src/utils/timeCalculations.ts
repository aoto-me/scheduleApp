// 2つの時間差を計算する関数
export function calculateTimeDifference(
  start: string,
  end: string,
): { hour: number; minute: number; diffMs: number } {
  // 時間の差を計算する（ミリ秒単位）
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();

  // 時間と分に変換する
  const hour = Math.floor(diffMs / (1000 * 60 * 60));
  const minute = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return { hour, minute, diffMs };
}

// 2つの時間差を計算する関数(ms)
export function calculateTimeDifferenceMs(
  ms1: number,
  ms2: number,
): { hour: number; minute: number; negative: boolean } {
  if (ms1 === 0 || ms2 === 0) {
    return { hour: 0, minute: 0, negative: false };
  }
  const diffMs = ms1 - ms2;
  const negative = diffMs < 0;
  const absoluteDiffMs = Math.abs(diffMs);
  const hour = Math.floor((absoluteDiffMs / (1000 * 60 * 60)) % 24);
  const minute = Math.floor((absoluteDiffMs / (1000 * 60)) % 60);

  return { hour, minute, negative };
}

// 時間をミリ秒に変換する関数(00:00:00形式)
export function timeStringToMilliseconds(timeString: string) {
  const [hours, minutes, seconds = 0] = timeString.split(":").map(Number);
  const milliseconds = (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
  return milliseconds;
}

// ミリ秒を時間に変換する関数
export function millisecondsToHours(ms: number) {
  let hours = ms / (1000 * 60 * 60);
  hours = Math.round(hours * 100) / 100;
  return hours;
}
