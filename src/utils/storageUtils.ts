// ユーザーのアップロード回数を管理するためのユーティリティ
import { DAILY_UPLOAD_LIMIT } from "./constants";

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
