// ユーザーのアップロード回数を管理するためのユーティリティ
import { DAILY_UPLOAD_LIMIT } from "./constants";

// メモリ内のフォールバックストレージ（localStorageが使用できない環境用）
const memoryStorage: Record<string, string> = {};

/**
 * ブラウザのlocalStorageが使用可能かチェック
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 安全にlocalStorageから値を取得する
 * localStorageが利用できない場合はメモリ内ストレージから取得
 */
function safeGetItem(key: string): string | null {
  try {
    if (isLocalStorageAvailable()) {
      return localStorage.getItem(key);
    }
    return memoryStorage[key] || null;
  } catch (e) {
    console.warn("localStorage access failed, using memory fallback");
    return memoryStorage[key] || null;
  }
}

/**
 * 安全にlocalStorageに値を設定する
 * localStorageが利用できない場合はメモリ内ストレージに設定
 */
function safeSetItem(key: string, value: string): void {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.setItem(key, value);
    } else {
      memoryStorage[key] = value;
    }
  } catch (e) {
    console.warn("localStorage access failed, using memory fallback");
    memoryStorage[key] = value;
  }
}

/**
 * ユーザーを識別するためのローカルIDを取得または生成する
 */
export function getUserId(): string {
  const storageKey = "lgtm-user-id";
  let userId = safeGetItem(storageKey);

  if (!userId) {
    // ランダムなIDを生成
    userId = `user_${Math.random().toString(36).substring(2, 15)}`;
    safeSetItem(storageKey, userId);
  }

  return userId;
}

/**
 * 本日のアップロード回数を取得する
 */
export function getTodayUploads(): number {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD形式
  const storageKey = `lgtm-uploads-${today}`;

  const count = safeGetItem(storageKey);
  return count ? parseInt(count, 10) : 0;
}

/**
 * アップロード回数をインクリメントする
 */
export function incrementUploadCount(): number {
  const today = new Date().toISOString().split("T")[0];
  const storageKey = `lgtm-uploads-${today}`;

  const currentCount = getTodayUploads();
  const newCount = currentCount + 1;

  safeSetItem(storageKey, newCount.toString());
  return newCount;
}

/**
 * ユーザーが本日の制限を超えているかチェックする
 */
export function isUploadLimitReached(): boolean {
  return getTodayUploads() >= DAILY_UPLOAD_LIMIT;
}

/**
 * 残りのアップロード可能回数を取得する
 */
export function getRemainingUploads(): number {
  const currentCount = getTodayUploads();
  return Math.max(0, DAILY_UPLOAD_LIMIT - currentCount);
}
