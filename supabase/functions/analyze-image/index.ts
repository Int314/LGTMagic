// Supabase Edge Function for analyzing images with Google Vision API
import { serve } from "http/server.ts";

interface AnalyzeImageRequest {
  image: string; // Base64エンコードされた画像データ
}

interface AnalyzeImageResponse {
  isAppropriate: boolean;
  reason: string | null;
  error?: string;
}

// CORSヘッダーを設定する関数（再利用のため）
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-client-info, apikey",
};

serve(async (req) => {
  // プリフライトリクエスト（OPTIONS）に対応
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // リクエストボディからデータを取得
    const { image } = (await req.json()) as AnalyzeImageRequest;

    if (!image) {
      return new Response(
        JSON.stringify({ error: "画像データが提供されていません" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Google Vision APIキーを環境変数から取得
    const apiKey = Deno.env.get("GOOGLE_VISION_API_KEY");

    if (!apiKey) {
      console.error("Google Vision API key not configured");
      return new Response(
        JSON.stringify({
          isAppropriate: true,
          reason: null,
          error: "API key not configured",
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Base64エンコードされた画像からdata:image部分を削除
    const base64Image = image.split(",")[1] || image;

    // Vision APIリクエスト用のペイロード作成
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: "SAFE_SEARCH_DETECTION",
              maxResults: 1,
            },
          ],
        },
      ],
    };

    // Google Vision APIにリクエスト送信
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const result = await response.json();

    // 不適切コンテンツの検出ロジック
    let isAppropriate = true;
    let reason: string | null = null;

    if (
      result.responses &&
      result.responses[0] &&
      result.responses[0].safeSearchAnnotation
    ) {
      const { adult, violence, racy } =
        result.responses[0].safeSearchAnnotation;

      // LIKELYまたはVERY_LIKELYの場合にブロック
      if (
        adult === "LIKELY" ||
        adult === "VERY_LIKELY" ||
        violence === "LIKELY" ||
        violence === "VERY_LIKELY" ||
        racy === "VERY_LIKELY"
      ) {
        isAppropriate = false;

        if (adult === "LIKELY" || adult === "VERY_LIKELY")
          reason = "アダルトコンテンツ";
        else if (violence === "LIKELY" || violence === "VERY_LIKELY")
          reason = "暴力的コンテンツ";
        else if (racy === "VERY_LIKELY") reason = "不適切なコンテンツ";
      }
    }

    return new Response(
      JSON.stringify({
        isAppropriate,
        reason,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error analyzing image:", error);
    return new Response(
      JSON.stringify({
        isAppropriate: true, // エラーの場合は安全側に倒して処理を継続
        reason: null,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
