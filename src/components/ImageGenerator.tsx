import React, { useRef, useState, useEffect } from "react";
import { generateLGTMImage, canvasToBlob } from "../utils/imageUtils";
import { uploadImage } from "../services/supabase";

interface ImageGeneratorProps {
  selectedImage: string | null;
  addLGTMText: boolean;
  onImageUploaded?: () => void;
}

/**
 * LGTM画像生成・アップロード用コンポーネント
 */
const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  selectedImage,
  addLGTMText,
  onImageUploaded,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 画像形式と品質の設定は内部的に使用するがUIから削除
  const imageFormat = "image/webp";
  const imageQuality = 0.8;

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
      // Convert canvas to blob with compression
      const blob = await canvasToBlob(
        canvasRef.current,
        imageFormat,
        imageQuality
      );

      // Upload to Supabase Storage
      const { url, error } = await uploadImage(blob);

      if (error) throw new Error(error);
      if (url) {
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

      {/* プレビュー画像とダウンロードは非表示にして、Canvasのみ残します（画像生成用） */}
      <div className="relative hidden">
        <canvas ref={canvasRef} className="w-full rounded-lg shadow-xl" />
        {(isGenerating || isUploading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
          </div>
        )}
      </div>

      {(isGenerating || isUploading) && (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span className="text-gray-300">
            {isGenerating ? "画像生成中..." : "画像アップロード中..."}
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
