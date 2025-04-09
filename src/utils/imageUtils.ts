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
        resolve(corsProxyUrl);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image from URL"));
      };
    } catch (err) {
      reject(new Error("Invalid URL or failed to load image"));
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
