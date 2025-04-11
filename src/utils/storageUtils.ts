// ユーザーのアップロード回数を管理するためのユーティリティ
import { DAILY_UPLOAD_LIMIT } from "./constants";

// セッション中に固定のユーザーIDを保持
let sessionUserId: string | null = null;

/**
 * ユーザーを識別するためのセッションIDを取得または生成する
 * localStorageは使用せず、メモリ内でのみ保持する
 */
export function getUserId(): string {
  if (!sessionUserId) {
    // セッション用のランダムなIDを生成
    sessionUserId = `session_${Math.random()
      .toString(36)
      .substring(2, 15)}_${Date.now()}`;
  }
  return sessionUserId;
}

/**
 * 本日のアップロード回数を取得する
 * 注意: 実際のカウントはSupabaseで管理し、この関数は使用しない
 */
export function getTodayUploads(): number {
  return 0; // 常に0を返す（Supabaseベースのカウントを使用するため）
}

/**
 * アップロード回数をインクリメントする
 * 注意: 実際のカウントはSupabaseで管理し、この関数は使用しない
 */
export function incrementUploadCount(): number {
  return 0; // 何も行わない（Supabaseベースのカウントを使用するため）
}

/**
 * ユーザーが本日の制限を超えているかチェックする
 * 注意: 実際のチェックはSupabaseで行い、この関数は使用しない
 */
export function isUploadLimitReached(): boolean {
  return false; // 常にfalseを返す（Supabaseベースのチェックを使用するため）
}

/**
 * 残りのアップロード可能回数を取得する
 * 注意: 実際のカウントはSupabaseで管理し、この関数は使用しない
 */
export function getRemainingUploads(): number {
  return DAILY_UPLOAD_LIMIT; // 常に最大値を返す（Supabaseベースのカウントを使用するため）
}
