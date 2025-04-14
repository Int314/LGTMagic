import { MAX_FILE_SIZE } from "./constants";

/**
 * フォントスタイル設定のインターフェース
 */
export interface FontSettings {
  mainFont?: string; // メインテキスト（LGTM）のフォント
  subFont?: string; // サブテキスト（Looks Good To Me）のフォント
  textColor?: string; // テキストの色
  bgOpacity?: number; // 背景の透明度（0～1）
  showSubtext?: boolean; // サブテキスト（Looks Good To Me）を表示するか
}

// デフォルトのフォント設定
export const DEFAULT_FONT_SETTINGS: FontSettings = {
  mainFont: "'Montserrat', 'Roboto', sans-serif",
  subFont: "'Montserrat', 'Roboto', sans-serif",
  textColor: "white",
  bgOpacity: 0.2,
  showSubtext: true,
};

/**
 * 画像にLGTMテキストを追加する
 */
export function generateLGTMImage(
  canvas: HTMLCanvasElement,
  selectedImage: string,
  addLGTMText: boolean,
  fontSettings: FontSettings = DEFAULT_FONT_SETTINGS
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

          // フォント設定を適用
          const settings = {
            ...DEFAULT_FONT_SETTINGS,
            ...fontSettings,
          };

          // 単色の半透明背景を描画
          ctx.fillStyle = `rgba(0, 0, 0, ${settings.bgOpacity})`;
          ctx.fillRect(0, backgroundY, targetWidth, backgroundHeight);

          // LGTMテキストの影を描画
          ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
          ctx.shadowBlur = lgtmFontSize * 0.15;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = lgtmFontSize * 0.05;

          // LGTM（メインテキスト）
          ctx.fillStyle = settings.textColor;
          ctx.font = `bold ${lgtmFontSize}px ${settings.mainFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // メインテキストの位置を調整
          ctx.fillText("LGTM", targetWidth / 2, textY - lgtmFontSize * 0.1);

          // サブテキスト（Looks Good To Me）をさらに下に配置
          if (settings.showSubtext) {
            ctx.shadowBlur = subtextFontSize * 0.1;
            ctx.font = `${subtextFontSize}px ${settings.subFont}`;
            ctx.fillStyle =
              settings.textColor === "white"
                ? "rgba(255, 255, 255, 0.85)"
                : `${settings.textColor}CC`; // カラーコードに透明度を追加

            // サブテキストの影を軽くする
            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
            ctx.shadowOffsetY = subtextFontSize * 0.03;

            // サブテキストの位置も適宜調整
            ctx.fillText(
              "Looks Good To Me",
              targetWidth / 2,
              textY + lgtmFontSize * 0.625
            );
          }

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
    } catch (e) {
      console.error("URLの解析に失敗:", e);
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
    // BlobをBase64に変換
    const base64Image = await blobToBase64(imageBlob);

    console.log("画像分析を開始します...");

    // Next.jsのAPI Routeを呼び出す
    const response = await fetch("/api/analyze-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64Image }),
    });

    console.log("API応答ステータス:", response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API応答データ:", data);

    // レスポンスデータを返す
    return {
      isAppropriate: data.isAppropriate,
      reason: data.reason,
    };
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
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
}
