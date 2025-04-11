"use client";

import { createClient } from "@supabase/supabase-js";
import {
  getUserId,
  incrementUploadCount,
  isUploadLimitReached,
  getRemainingUploads,
} from "../utils/storageUtils";
import { DAILY_UPLOAD_LIMIT } from "../utils/constants";
import { getUserIpAddress } from "../utils/ipUtils";

// Supabaseクライアント
let supabaseClient: any;

// ブラウザ環境か確認
const isBrowser = typeof window !== "undefined";

// URLが有効か検証する関数
function isValidURL(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
}

// Supabaseクライアントの初期化
if (isBrowser) {
  try {
    // 環境変数からURL設定を取得
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 環境変数チェック
    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "環境変数が設定されていません。.env.localファイルを確認してください。"
      );
    }

    // URL検証
    if (!isValidURL(supabaseUrl)) {
      console.error("❌ 無効なSupabase URL:", supabaseUrl);
      throw new Error("無効なSupabase URL");
    }

    console.log("🔌 Supabaseに接続:", supabaseUrl);
    console.log("🔑 APIキーの長さ:", supabaseKey?.length || 0);

    // クライアントを生成
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    // 接続テスト
    console.log("✅ Supabaseクライアント初期化成功");
  } catch (error) {
    console.error("🔴 Supabaseクライアント初期化エラー:", error);

    // エラー発生時は簡易スタブを提供
    supabaseClient = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
        }),
        insert: () => Promise.resolve({ error: null }),
        update: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        }),
      }),
      storage: {
        from: () => ({
          list: () => Promise.resolve({ data: [], error: null }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
          upload: () => Promise.resolve({ data: null, error: null }),
          remove: () => Promise.resolve({ error: null }),
        }),
      },
    };

    console.warn("⚠️ Supabase接続エラー - スタブを使用します");
  }
} else {
  // サーバーサイドレンダリング時の簡易スタブ
  supabaseClient = {
    from: () => ({ select: () => {}, update: () => {}, insert: () => {} }),
    storage: {
      from: () => ({
        list: () => {},
        getPublicUrl: () => {},
        upload: () => {},
      }),
    },
  };
}

// エクスポートするクライアント
export const supabase = supabaseClient;

// Type for storage data
export interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
}

/**
 * IPアドレスによるアップロード回数チェック
 * DBと連携して確認し、制限を超えていればtrueを返す
 */
export async function checkUploadLimitByIp(): Promise<{
  limitReached: boolean;
  currentCount: number;
  error: string | null;
}> {
  try {
    const ipAddress = await getUserIpAddress();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD形式

    // Supabaseからデータを取得
    const { data, error } = await supabase
      .from("upload_limits")
      .select("upload_count")
      .eq("ip_address", ipAddress)
      .eq("upload_date", today)
      .maybeSingle(); // single()の代わりにmaybeSingle()を使用

    if (error) throw error;

    // データが見つかった場合はその値を返す、見つからない場合は0を返す
    const currentCount = data ? data.upload_count : 0;

    return {
      limitReached: currentCount >= DAILY_UPLOAD_LIMIT,
      currentCount,
      error: null,
    };
  } catch (err) {
    console.error("Error checking upload limit:", err);

    // エラー発生時は制限に達していないと仮定して処理を続ける
    return {
      limitReached: false,
      currentCount: 0,
      error:
        err instanceof Error
          ? err.message
          : "アップロード制限の確認に失敗しました",
    };
  }
}

/**
 * IPアドレスベースでアップロード回数をインクリメント
 * ローカルストレージには保存せず、Supabaseのみを更新
 */
export async function incrementUploadCountByIp(): Promise<{
  success: boolean;
  currentCount: number;
  error: string | null;
}> {
  try {
    const ipAddress = await getUserIpAddress();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD形式

    // まず、既存のレコードを検索
    const { data: existingRecord, error: selectError } = await supabase
      .from("upload_limits")
      .select("upload_count")
      .eq("ip_address", ipAddress)
      .eq("upload_date", today)
      .maybeSingle(); // single()の代わりにmaybeSingle()を使用

    let currentCount = 1;

    if (selectError && selectError.code !== "PGRST116") {
      // PGRST116は「レコードが見つからない」エラー
      throw selectError;
    }

    if (existingRecord) {
      // 既存レコードが見つかった場合は更新
      currentCount = existingRecord.upload_count + 1;

      const { error: updateError } = await supabase
        .from("upload_limits")
        .update({ upload_count: currentCount })
        .eq("ip_address", ipAddress)
        .eq("upload_date", today);

      if (updateError) throw updateError;
    } else {
      // レコードが見つからない場合は新規作成
      const { error: insertError } = await supabase
        .from("upload_limits")
        .insert([
          {
            ip_address: ipAddress,
            upload_date: today,
            upload_count: 1,
          },
        ]);

      if (insertError) throw insertError;
    }

    return {
      success: true,
      currentCount,
      error: null,
    };
  } catch (err) {
    console.error("Error incrementing upload count:", err);

    return {
      success: false,
      currentCount: 0,
      error:
        err instanceof Error
          ? err.message
          : "アップロード回数の更新に失敗しました",
    };
  }
}

/**
 * 画像ギャラリーを取得する
 */
export async function fetchGalleryImages(): Promise<string[]> {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from("lgtm-images")
      .list("", {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (listError) {
      throw listError;
    }

    if (!files) {
      throw new Error("No data received from storage");
    }

    // Get public URLs for all files
    const imageUrls = files.map((file) => {
      const {
        data: { publicUrl },
      } = supabase.storage.from("lgtm-images").getPublicUrl(file.name);
      return publicUrl;
    });

    return imageUrls;
  } catch (err) {
    console.error("Error fetching images:", err);
    return [];
  }
}

/**
 * 画像をSupabaseにアップロードする
 * アップロード回数制限のチェックと不適切コンテンツのチェックを含む
 */
export async function uploadImage(
  blob: Blob
): Promise<{ url: string | null; error: string | null }> {
  try {
    // IPアドレスベースでアップロード制限をチェック
    const { limitReached, error: limitError } = await checkUploadLimitByIp();

    if (limitError) {
      console.warn("Upload limit check failed:", limitError);
    } else if (limitReached) {
      return {
        url: null,
        error: `セキュリティのため、1日のアップロード回数は${DAILY_UPLOAD_LIMIT}回までに制限されています。明日また試してください。`,
      };
    }

    // 不適切なコンテンツのチェック
    try {
      const { analyzeImageContent } = await import("../utils/imageUtils");
      const { isAppropriate, reason } = await analyzeImageContent(blob);

      if (!isAppropriate) {
        return {
          url: null,
          error: `アップロードできません: ${
            reason || "不適切な画像と判断されました"
          }。ガイドラインに沿った画像を選択してください。`,
        };
      }
    } catch (analyzeError) {
      console.warn("Image content analysis failed:", analyzeError);
    }

    // Get content type from blob
    const contentType = blob.type || "image/webp";

    // Determine file extension based on content type
    const fileExtension =
      contentType === "image/webp"
        ? "webp"
        : contentType === "image/jpeg"
        ? "jpg"
        : "png";

    // Upload to Supabase Storage with public access
    const userId = getUserId();
    const fileName = `lgtm-${userId}-${Date.now()}.${fileExtension}`;
    const { data, error: uploadError } = await supabase.storage
      .from("lgtm-images")
      .upload(fileName, blob, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // アップロード回数をインクリメント（IPアドレスベース）
    await incrementUploadCountByIp();

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("lgtm-images").getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  } catch (err) {
    console.error("Error uploading image:", err);
    return {
      url: null,
      error: err instanceof Error ? err.message : "Failed to upload image",
    };
  }
}
