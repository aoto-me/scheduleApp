// 数値を日本円に変換する
export function formatCurrency(amount: number): string {
  return amount.toLocaleString("ja-JP");
}
