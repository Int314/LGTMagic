import React, { useRef, useState, useEffect } from "react";
import { Download, Share2 } from "lucide-react";
import { generateLGTMImage, canvasToBlob } from "../utils/imageUtils";
import { uploadImage } from "../services/supabase";

interface ImageGeneratorProps {
  selectedImage: string | null;
  addLGTMText: boolean;
  onImageUploaded?: () => void;
}

/**
 * LGTM画像生成・プレビュー用コンポーネント
 */
const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  selectedImage,
  addLGTMText,
  onImageUploaded,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageFormat, setImageFormat] = useState<string>("image/webp");
  const [imageQuality, setImageQuality] = useState<number>(0.8);

  // 画像が選択されたらLGTM画像を生成
  useEffect(() => {
    if (selectedImage && canvasRef.current) {
      generateImage();
    }
  }, [selectedImage, addLGTMText]);

  const generateImage = async () => {
    if (!selectedImage || !canvasRef.current) return;

    setIsGenerating(true);
    setError(null);

    try {
      await generateLGTMImage(canvasRef.current, selectedImage, addLGTMText);
      await uploadGeneratedImage();
    } catch (err) {
      console.error("Error generating image:", err);
      setError(err instanceof Error ? err.message : "画像の生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  };

  const uploadGeneratedImage = async () => {
    if (!canvasRef.current) return;

    setIsUploading(true);
    setError(null);

    try {
      // Convert canvas to blob with WebP compression
      const blob = await canvasToBlob(
        canvasRef.current,
        imageFormat,
        imageQuality
      );

      // Upload to Supabase Storage
      const { url, error } = await uploadImage(blob);

      if (error) throw new Error(error);
      if (url) {
        setUploadedUrl(url);
        onImageUploaded?.();
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setError(
        err instanceof Error ? err.message : "アップロードに失敗しました"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const downloadImage = () => {
    if (!canvasRef.current) return;

    // 圧縮してダウンロードする
    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          const link = document.createElement("a");
          link.download = `lgtm-image.${
            imageFormat === "image/webp" ? "webp" : "png"
          }`;
          link.href = URL.createObjectURL(blob);
          link.click();
          // Clean up
          URL.revokeObjectURL(link.href);
        }
      },
      imageFormat,
      imageQuality
    );
  };

  // クリックでURLを選択状態にする
  const handleUrlClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  // 画像の圧縮品質を変更するハンドラー
  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quality = parseFloat(e.target.value);
    setImageQuality(quality);
  };

  // 画像のフォーマットを変更するハンドラー
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setImageFormat(e.target.value);
  };

  if (!selectedImage) {
    return null;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
          <p className="text-center">{error}</p>
        </div>
      )}

      <div className="relative">
        <canvas ref={canvasRef} className="w-full rounded-lg shadow-xl" />
        {(isGenerating || isUploading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="w-full max-w-md space-y-2">
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-400 w-24">画像形式:</label>
            <select
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-gray-200 flex-1"
              value={imageFormat}
              onChange={handleFormatChange}
              disabled={isGenerating || isUploading}
            >
              <option value="image/webp">WebP (推奨)</option>
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-400 w-24">圧縮品質:</label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={imageQuality}
              onChange={handleQualityChange}
              className="flex-1"
              disabled={
                isGenerating || isUploading || imageFormat === "image/png"
              }
            />
            <span className="text-gray-300 w-12 text-center">
              {Math.round(imageQuality * 100)}%
            </span>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            {imageFormat === "image/webp"
              ? "WebPは高圧縮でも高画質を維持できる最新フォーマットです"
              : imageFormat === "image/png"
              ? "PNGは圧縮なしの高品質フォーマットです"
              : "JPEGは写真向けの一般的なフォーマットです"}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={downloadImage}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
            disabled={isGenerating || isUploading}
          >
            <Download className="w-4 h-4" />
            ダウンロード
          </button>
        </div>

        {uploadedUrl && (
          <div className="text-center w-full max-w-xl">
            <p className="text-gray-400 mb-2">LGTM画像を共有:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={uploadedUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-800 rounded-l border border-gray-700 text-gray-200"
                onClick={handleUrlClick}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(uploadedUrl);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-r border border-gray-600 transition duration-200"
                title="URLをコピー"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
