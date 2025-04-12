import { NextResponse } from "next/server";

interface AnalyzeImageRequest {
  image: string; // Base64エンコードされた画像データ
}

interface AnalyzeImageResponse {
  isAppropriate: boolean;
  reason: string | null;
  error?: string;
}

/**
 * 画像分析用のAPI Route
 * Supabase Edge Functionから移行した機能
 */
export async function POST(request: Request) {
  try {
    console.log("API: 画像分析リクエストを受信しました");

    // リクエストボディからデータを取得
    const { image } = (await request.json()) as AnalyzeImageRequest;

    if (!image) {
      console.error("API: 画像データが提供されていません");
      return NextResponse.json(
        { error: "画像データが提供されていません" },
        { status: 400 }
      );
    }

    // Google Vision APIキーを環境変数から取得
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    console.log(
      "API: Google Vision APIキー取得状態:",
      apiKey ? "設定済み" : "未設定"
    );

    if (!apiKey) {
      console.error("API: Google Vision API key not configured");
      return NextResponse.json({
        isAppropriate: true,
        reason: null,
        error: "API key not configured",
      });
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

    console.log("API: Google Vision APIを呼び出します");

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

    console.log("API: Google Vision APIレスポンスステータス:", response.status);

    const result = await response.json();
    console.log("API: Vision APIレスポンス:", JSON.stringify(result, null, 2));

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

      console.log("API: SafeSearch結果:", { adult, violence, racy });

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
    } else {
      console.warn("API: SafeSearchAnnotationが見つかりませんでした");
    }

    console.log("API: 分析結果:", { isAppropriate, reason });

    return NextResponse.json({
      isAppropriate,
      reason,
    });
  } catch (error: any) {
    console.error("API: Error analyzing image:", error);
    return NextResponse.json(
      {
        isAppropriate: true, // エラーの場合は安全側に倒して処理を継続
        reason: null,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// OPTIONSメソッドの追加（CORSサポート）
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, x-client-info, apikey",
      },
    }
  );
}
