import { createClient } from "@supabase/supabase-js";

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
 */
export async function uploadImage(
  blob: Blob
): Promise<{ url: string | null; error: string | null }> {
  try {
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
    const fileName = `lgtm-${Date.now()}.${fileExtension}`;
    const { data, error: uploadError } = await supabase.storage
      .from("lgtm-images")
      .upload(fileName, blob, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

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
