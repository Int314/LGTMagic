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
        // Calculate text sizes based on image width
        const lgtmFontSize = Math.min(targetWidth * 0.15, targetHeight * 0.2);
        const subtextFontSize = Math.min(
          targetWidth * 0.05,
          targetHeight * 0.06
        );

        // Calculate background height based on font sizes
        const backgroundHeight = lgtmFontSize * 2 + subtextFontSize * 2;

        // Add semi-transparent background for text
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(
          0,
          (targetHeight - backgroundHeight) / 2,
          targetWidth,
          backgroundHeight
        );

        // Draw "LGTM"
        ctx.fillStyle = "white";
        ctx.font = `bold ${lgtmFontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          "LGTM",
          targetWidth / 2,
          targetHeight / 2 - lgtmFontSize * 0.5
        );

        // Draw "Looks Good To Me"
        ctx.font = `${subtextFontSize}px sans-serif`;
        ctx.fillText(
          "Looks Good To Me",
          targetWidth / 2,
          targetHeight / 2 + lgtmFontSize * 0.5
        );
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
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create image blob"));
    }, "image/png");
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
