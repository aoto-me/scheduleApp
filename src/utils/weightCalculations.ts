import { Health } from "../types";

// 月の平均体重を計算
export const calculateAverageBodyWeight = (data: Health[]) => {
  let totalWeight = 0;
  let nonZeroCount = 0;

  // 合計値と0でない要素の数を計算
  for (const item of data) {
    const weight = parseFloat(item.body);
    if (Number(weight)) {
      totalWeight += weight;
      if (Number(weight) !== 0) {
        nonZeroCount += 1;
      }
    }
  }

  // 平均値を計算
  const averageWeightFloat = nonZeroCount > 0 ? totalWeight / nonZeroCount : 0;
  const averageWeight = Math.round(averageWeightFloat * 10) / 10;

  return averageWeight;
};
