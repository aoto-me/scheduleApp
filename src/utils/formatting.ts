// 数値を日本円に変換する
export function formatCurrency(amount: number): string {
  return amount.toLocaleString("ja-JP");
}

// Base64エンコード
export function base64Encode(str: string) {
  return btoa(encodeURIComponent(str));
}

// Base64デコード
export function base64Decode(str: string) {
  return decodeURIComponent(atob(str));
}
