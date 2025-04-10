import { MAX_FILE_SIZE } from "./constants";

/**
 * 画像にLGTMテキストを追加する
 */
export function generateLGTMImage(
  canvas: HTMLCanvasElement,
  selectedImage: string,
  addLGTMText: boolean
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas context not available"));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // 画像のリサイズ処理（横幅を600pxに固定し、縦横比を維持）
      const targetWidth = 600;
      const aspectRatio = img.height / img.width;
      const targetHeight = Math.round(targetWidth * aspectRatio);

      // Set canvas size to the resized dimensions
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw resized image
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      if (addLGTMText) {
        // テキストサイズの計算
        const lgtmFontSize = Math.min(targetWidth * 0.15, targetHeight * 0.2);
        const subtextFontSize = Math.min(
          targetWidth * 0.035,
          targetHeight * 0.04
        );

        // テキスト位置の計算 - 中心位置を基準に
        const textY = targetHeight / 2;

        // テキストのスタイル設定
        const renderStylishText = () => {
          // 背景の高さを調整
          const backgroundHeight = lgtmFontSize * 1.8; // 高さを少し大きくして余白を確保
          const backgroundY = textY - backgroundHeight / 2;

          // 単色の半透明背景を描画
          ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
          ctx.fillRect(0, backgroundY, targetWidth, backgroundHeight);

          // LGTMテキストの影を描画
          ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
          ctx.shadowBlur = lgtmFontSize * 0.15;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = lgtmFontSize * 0.05;

          // LGTM（メインテキスト）
          ctx.fillStyle = "white";
          ctx.font = `bold ${lgtmFontSize}px 'Arial', sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // メインテキストの位置を上に移動
          ctx.fillText("LGTM", targetWidth / 2, textY - lgtmFontSize * 0.25);

          // サブテキスト（Looks Good To Me）をさらに下に配置
          ctx.shadowBlur = subtextFontSize * 0.1;
          ctx.font = `${subtextFontSize}px 'Arial', sans-serif`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";

          // サブテキストの影を軽くする
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
          ctx.shadowOffsetY = subtextFontSize * 0.03;

          // サブテキストの位置を下に移動してスペースを広げる
          ctx.fillText(
            "Looks Good To Me",
            targetWidth / 2,
            textY + lgtmFontSize * 0.5
          );

          // 影をリセット
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        };

        // テキスト描画を実行
        renderStylishText();
      }

      resolve();
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = selectedImage;
  });
}

/**
 * Canvasをblobに変換する
 * @param canvas 変換するCanvas要素
 * @param format 画像フォーマット ('image/png', 'image/webp', 'image/jpeg')
 * @param quality 圧縮品質 (0.0 ～ 1.0) - WebPとJPEG形式でのみ有効
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string = "image/webp",
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create image blob"));
      },
      format,
      quality
    );
  });
}

/**
 * URLから画像を読み込む
 */
export function loadImageFromUrl(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Validate URL
      new URL(imageUrl);

      // Use a CORS proxy to load the image
      const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(
        imageUrl
      )}`;

      // Load image from URL
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = corsProxyUrl;

      img.onload = () => {
        // ファイルサイズの制限をチェック
        fetch(corsProxyUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error("画像の取得に失敗しました");
            }
            return response.blob();
          })
          .then((blob) => {
            if (blob.size > MAX_FILE_SIZE) {
              const sizeMB = (blob.size / (1024 * 1024)).toFixed(1);
              reject(
                new Error(
                  `画像サイズが大きすぎます（${sizeMB}MB）。5MB以下の画像を選択してください`
                )
              );
            } else {
              resolve(corsProxyUrl);
            }
          })
          .catch((error) => {
            reject(error);
          });
      };

      img.onerror = () => {
        reject(new Error("URLから画像を読み込めませんでした"));
      };
    } catch (err) {
      reject(new Error("無効なURLか、画像の読み込みに失敗しました"));
    }
  });
}

/**
 * 選択された画像ファイルを読み込む
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Failed to read file as data URL"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// 不適切な画像をフィルタリングするための関数
export async function analyzeImageContent(imageBlob: Blob): Promise<{
  isAppropriate: boolean;
  reason: string | null;
}> {
  try {
    // ここでは例としてGoogle Cloud Vision APIを使用する実装を示しています
    // 実際には適切なAPIキーと環境変数の設定が必要です
    const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;

    if (!apiKey) {
      console.warn(
        "Google Vision API key not configured, skipping content analysis"
      );
      return { isAppropriate: true, reason: null };
    }

    // 画像をbase64エンコード
    const base64Image = await blobToBase64(imageBlob);

    // Vision APIリクエスト用のペイロード作成
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image.split(",")[1], // base64のdata:image部分を削除
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

    // APIリクエスト送信
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
    if (
      result.responses &&
      result.responses[0] &&
      result.responses[0].safeSearchAnnotation
    ) {
      const { adult, violence, racy, medical } =
        result.responses[0].safeSearchAnnotation;

      // LIKELYまたはVERY_LIKELYの場合にブロック
      if (
        adult === "LIKELY" ||
        adult === "VERY_LIKELY" ||
        violence === "LIKELY" ||
        violence === "VERY_LIKELY" ||
        racy === "VERY_LIKELY"
      ) {
        let reason = "";

        if (adult === "LIKELY" || adult === "VERY_LIKELY")
          reason = "アダルトコンテンツ";
        else if (violence === "LIKELY" || violence === "VERY_LIKELY")
          reason = "暴力的コンテンツ";
        else if (racy === "VERY_LIKELY") reason = "不適切なコンテンツ";

        return { isAppropriate: false, reason };
      }
    }

    return { isAppropriate: true, reason: null };
  } catch (error) {
    console.error("画像分析中にエラーが発生しました:", error);
    // エラーの場合は安全のためtrueを返し、別の方法で検証
    return { isAppropriate: true, reason: null };
  }
}

// BlobをBase64に変換するヘルパー関数
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
