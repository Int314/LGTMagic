import { createClient } from "@supabase/supabase-js";
import {
  getUserId,
  incrementUploadCount,
  isUploadLimitReached,
  DAILY_UPLOAD_LIMIT,
} from "../utils/storageUtils";
import { getUserIpAddress } from "../utils/ipUtils";

// Initialize Supabase client with proper types
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Since we don't need auth for this app
  },
});

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

    // 既存のレコードを検索
    const { data, error } = await supabase
      .from("upload_limits")
      .select("upload_count")
      .eq("ip_address", ipAddress)
      .eq("upload_date", today)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116は「レコードが見つからない」エラー
      throw error;
    }

    // 現在のカウント（レコードがない場合は0）
    const currentCount = data?.upload_count || 0;

    return {
      limitReached: currentCount >= DAILY_UPLOAD_LIMIT,
      currentCount,
      error: null,
    };
  } catch (err) {
    console.error("Error checking upload limit:", err);

    // エラーが発生しても、ユーザー体験を維持するためにローカルストレージにフォールバック
    const isLimitReached = isUploadLimitReached();
    return {
      limitReached: isLimitReached,
      currentCount: isLimitReached ? DAILY_UPLOAD_LIMIT : 0,
      error:
        err instanceof Error
          ? err.message
          : "アップロード制限の確認に失敗しました",
    };
  }
}

/**
 * IPアドレスベースでアップロード回数をインクリメント
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
      .single();

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

    // ローカルストレージにも保存（フォールバック用）
    incrementUploadCount();

    return {
      success: true,
      currentCount,
      error: null,
    };
  } catch (err) {
    console.error("Error incrementing upload count:", err);

    // エラー時はローカルストレージの値を使用
    const localCount = incrementUploadCount();

    return {
      success: false,
      currentCount: localCount,
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
export async function fetchGalleryImages(): Promise<{
  imageUrls: string[];
  error: string | null;
}> {
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

    return { imageUrls, error: null };
  } catch (err) {
    console.error("Error fetching images:", err);
    return {
      imageUrls: [],
      error: err instanceof Error ? err.message : "Failed to fetch images",
    };
  }
}

/**
 * 画像をSupabaseにアップロードする
 * アップロード回数制限のチェックを含む
 */
export async function uploadImage(
  blob: Blob
): Promise<{ url: string | null; error: string | null }> {
  try {
    // IPアドレスベースでアップロード制限をチェック
    const { limitReached, error: limitError } = await checkUploadLimitByIp();

    if (limitError) {
      console.warn(
        "Upload limit check failed, falling back to local storage:",
        limitError
      );
      // エラー発生時はローカルストレージの判定にフォールバック
      if (isUploadLimitReached()) {
        return {
          url: null,
          error: `セキュリティのため、1日のアップロード回数は${DAILY_UPLOAD_LIMIT}回までに制限されています。明日また試してください。`,
        };
      }
    } else if (limitReached) {
      return {
        url: null,
        error: `セキュリティのため、1日のアップロード回数は${DAILY_UPLOAD_LIMIT}回までに制限されています。明日また試してください。`,
      };
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
