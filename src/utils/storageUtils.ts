// ユーザーのアップロード回数を管理するためのユーティリティ

/**
 * ユーザーを識別するためのローカルIDを取得または生成する
 */
export function getUserId(): string {
  const storageKey = "lgtm-user-id";
  let userId = localStorage.getItem(storageKey);

  if (!userId) {
    // ランダムなIDを生成
    userId = `user_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(storageKey, userId);
  }

  return userId;
}

/**
 * 1日あたりのアップロード制限
 */
export const DAILY_UPLOAD_LIMIT = 5;

/**
 * 本日のアップロード回数を取得する
 */
export function getTodayUploads(): number {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD形式
  const storageKey = `lgtm-uploads-${today}`;

  const count = localStorage.getItem(storageKey);
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

  localStorage.setItem(storageKey, newCount.toString());
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
