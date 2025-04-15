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
  showBackground?: boolean; // 背景を表示するか
  // 新しく追加するプロパティ
  mainTextColor?: string; // メインテキスト色
  mainTextGradient?: string; // メインテキストのグラデーション種類
  subTextColor?: string; // サブテキスト色
  subTextGradient?: string; // サブテキストのグラデーション種類
  showMainText?: boolean; // メインテキスト（LGTM）を表示するか
  bgColor?: string; // 背景色
}

// デフォルトのフォント設定
export const DEFAULT_FONT_SETTINGS: FontSettings = {
  mainFont: "'Montserrat', 'Roboto', sans-serif",
  subFont: "'Montserrat', 'Roboto', sans-serif",
  textColor: "white",
  bgOpacity: 0.2,
  showSubtext: true,
  showBackground: true,
  // 新しいプロパティのデフォルト値
  mainTextColor: "white",
  mainTextGradient: "none",
  subTextColor: "white",
  subTextGradient: "none",
  showMainText: true, // LGTMテキストを表示するデフォルト値
  bgColor: "black", // 背景色のデフォルト値
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
          // フォント設定を適用
          const settings = {
            ...DEFAULT_FONT_SETTINGS,
            ...fontSettings,
          };

          // 背景の高さを調整
          const backgroundHeight = lgtmFontSize * 1.8; // 高さを少し大きくして余白を確保
          const backgroundY = textY - backgroundHeight / 2;

          // 背景表示が有効な場合のみ背景を描画
          if (settings.showBackground) {
            // 背景色の設定を適用
            const bgColor = settings.bgColor || "black";
            ctx.fillStyle = `rgba(${getColorRGBValues(bgColor)}, ${
              settings.bgOpacity
            })`;
            ctx.fillRect(0, backgroundY, targetWidth, backgroundHeight);
          }

          // 下位互換のためtextColorをmainTextColorとsubTextColorに適用
          const mainColor =
            settings.mainTextColor || settings.textColor || "white";
          const subColor =
            settings.subTextColor || settings.textColor || "white";

          // メインテキスト（LGTM）の描画
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // メインテキストの影設定
          ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
          ctx.shadowBlur = lgtmFontSize * 0.15;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = lgtmFontSize * 0.05;

          // LGTM（メインテキスト）のフォント設定
          ctx.font = `bold ${lgtmFontSize}px ${settings.mainFont}`;

          ctx.fillStyle = mainColor;

          // メインテキストの位置を調整して描画
          if (settings.showMainText) {
            ctx.fillText("LGTM", targetWidth / 2, textY - lgtmFontSize * 0.1);
          }

          // サブテキスト（Looks Good To Me）をさらに下に配置
          if (settings.showSubtext) {
            ctx.shadowBlur = subtextFontSize * 0.1;
            ctx.font = `${subtextFontSize}px ${settings.subFont}`;

            // サブテキスト
            ctx.fillStyle =
              subColor === "white"
                ? "rgba(255, 255, 255, 0.85)"
                : addAlphaToColor(subColor, 0.85);

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
 * グラデーションを作成する補助関数
 */
function createTextGradient(
  ctx: CanvasRenderingContext2D,
  gradientConfig: { colors: string[]; direction: string },
  x0: number,
  y0: number,
  x1: number,
  y1: number
): CanvasGradient {
  const gradient =
    gradientConfig.direction === "horizontal"
      ? ctx.createLinearGradient(x0, y0, x1, y0)
      : ctx.createLinearGradient(x0, y0, x0, y1);

  gradientConfig.colors.forEach((color, index) => {
    const offset = index / (gradientConfig.colors.length - 1);
    gradient.addColorStop(offset, color);
  });

  return gradient;
}

/**
 * カラーに透明度を追加する関数
 */
function addAlphaToColor(color: string, alpha: number): string {
  // 16進数カラーコードの場合
  if (color.startsWith("#")) {
    return (
      color +
      Math.round(alpha * 255)
        .toString(16)
        .padStart(2, "0")
    );
  }
  // CSSカラー名の場合
  return color.includes("rgba")
    ? color
    : `${color.replace("rgb", "rgba").replace(")", ", " + alpha + ")")}`;
}

/**
 * カラー名をRGB値に変換する関数
 */
function getColorRGBValues(color: string): string {
  // 一般的なカラー名のRGB値マッピング
  const colorMap: Record<string, string> = {
    black: "0, 0, 0",
    white: "255, 255, 255",
    red: "255, 0, 0",
    lime: "0, 255, 0",
    blue: "0, 0, 255",
    yellow: "255, 255, 0",
    cyan: "0, 255, 255",
    magenta: "255, 0, 255",
    silver: "192, 192, 192",
    gray: "128, 128, 128",
    maroon: "128, 0, 0",
    olive: "128, 128, 0",
    green: "0, 128, 0",
    purple: "128, 0, 128",
    teal: "0, 128, 128",
    navy: "0, 0, 128",
    orange: "255, 165, 0",
    pink: "255, 192, 203",
    dodgerblue: "30, 144, 255",
  };

  // カラーマップにある場合はその値を返す
  if (colorMap[color.toLowerCase()]) {
    return colorMap[color.toLowerCase()];
  }

  // 16進数の場合は RGB に変換
  if (color.startsWith("#")) {
    let hex = color.substring(1);

    // 短縮形の場合は展開する (#abc -> #aabbcc)
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
  }

  // どれにも当てはまらない場合はデフォルトで黒を返す
  return "0, 0, 0";
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
