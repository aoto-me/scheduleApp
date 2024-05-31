import { Balance, Money } from "../types";

// 月ごとの収支を計算する関数
export function financeCalculations(moneyData: Money[]): Balance {
  return moneyData.reduce(
    (acc, item) => {
      // amountが文字列として扱われてしまっているので、念のためNumber型に変換
      const amount = Number(item.amount);
      if (item.type === "収入") {
        acc.income += amount;
      } else {
        acc.expense += amount;
      }
      acc.balance = acc.income - acc.expense;
      return acc;
    },
    { income: 0, expense: 0, balance: 0 },
  );
}

// 1か月分のデータを受け取って、各日付ごとの収支を計算する関数
export function calculateDailyBalances(
  moneyData: Money[],
): Record<string, Balance> {
  return moneyData.reduce<Record<string, Balance>>((acc, item) => {
    const day = item.date;
    // amountが文字列として扱われてしまっているので、念のためNumber型に変換
    const amount = Number(item.amount);
    if (!acc[day]) {
      acc[day] = { income: 0, expense: 0, balance: 0 };
    }
    if (item.type === "収入") {
      acc[day].income += amount;
    } else {
      acc[day].expense += amount;
    }
    acc[day].balance = acc[day].income - acc[day].expense;
    return acc;
  }, {});
}
