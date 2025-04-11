/**
 * IPアドレスを取得するためのユーティリティ
 */

// IPアドレス取得用のAPIエンドポイント - より信頼性の高いサービスに変更
const IP_API_URL = "https://api64.ipify.org?format=json";
// バックアップAPIエンドポイント
const BACKUP_IP_API_URL = "https://api.my-ip.io/ip.json";

// IPアドレスのキャッシュ（セッション中は同じIP扱い）
let cachedIp: string | null = null;

// ローカルストレージキー
const ANONYMOUS_ID_KEY = "lgtm_anonymous_id";

/**
 * 匿名識別子を取得または生成する
 */
function getOrCreateAnonymousId(): string {
  try {
    // ローカルストレージから取得を試みる
    let anonymousId = localStorage.getItem(ANONYMOUS_ID_KEY);

    // 存在しない場合は新しく生成して保存
    if (!anonymousId) {
      anonymousId = `anon_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 10)}`;
      localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId);
    }

    return anonymousId;
  } catch (e) {
    console.error("ローカルストレージの取得に失敗:", e);
    // ローカルストレージが使用できない場合は一時的なIDを返す
    return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }
}

/**
 * ユーザーのIPアドレスを取得する
 * 失敗した場合は匿名識別子を返す
 */
export async function getUserIpAddress(): Promise<string> {
  // キャッシュされたIPがあれば返す
  if (cachedIp) {
    return cachedIp;
  }

  try {
    // タイムアウトつきのfetch関数
    const fetchWithTimeout = async (url: string, timeout: number) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        clearTimeout(id);
        return response;
      } catch (e) {
        clearTimeout(id);
        throw e;
      }
    };

    // 最初のAPIを試す
    let response;
    let data;

    try {
      response = await fetchWithTimeout(IP_API_URL, 3000); // 3秒タイムアウト
      data = await response.json();

      if (data && data.ip) {
        cachedIp = data.ip;
        return data.ip;
      }
    } catch (primaryError) {
      console.warn("Primary IP API failed:", primaryError);

      // バックアップAPIを試す
      try {
        response = await fetchWithTimeout(BACKUP_IP_API_URL, 3000);
        data = await response.json();

        if (data && (data.ip || data.clientIp)) {
          cachedIp = data.ip || data.clientIp;
          return cachedIp || getOrCreateAnonymousId(); // nullの場合に匿名IDを返す
        }
      } catch (backupError) {
        console.warn("Backup IP API failed:", backupError);
        throw new Error("Both IP APIs failed");
      }
    }

    // どちらのAPIからもIPが取得できなかった場合
    throw new Error("IP address not found in response");
  } catch (error) {
    console.error("Failed to fetch IP address:", error);
    // 安定した匿名識別子を使用
    const anonymousId = getOrCreateAnonymousId();
    cachedIp = anonymousId;
    return anonymousId;
  }
}
