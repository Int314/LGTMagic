/**
 * IPアドレスを取得するためのユーティリティ
 */

// IPアドレス取得用のAPIエンドポイント
const IP_API_URL = "https://api.ipify.org?format=json";

// IPアドレスのキャッシュ（セッション中は同じIP扱い）
let cachedIp: string | null = null;

/**
 * ユーザーのIPアドレスを取得する
 */
export async function getUserIpAddress(): Promise<string> {
  // キャッシュされたIPがあれば返す
  if (cachedIp) {
    return cachedIp;
  }

  try {
    const response = await fetch(IP_API_URL);
    const data = await response.json();

    if (data.ip) {
      cachedIp = data.ip;
      return data.ip;
    }

    throw new Error("IP address not found in response");
  } catch (error) {
    console.error("Failed to fetch IP address:", error);
    // フォールバックとして、ランダムな識別子を生成
    // 実際のIPではないが、セッション内で一貫した識別子として機能する
    const fallbackId = `anonymous_${Math.random()
      .toString(36)
      .substring(2, 15)}`;
    cachedIp = fallbackId;
    return fallbackId;
  }
}
