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
      // Convert canvas to blob
      const blob = await canvasToBlob(canvasRef.current);

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
    const link = document.createElement("a");
    link.download = "lgtm-image.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  // クリックでURLを選択状態にする
  const handleUrlClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.select();
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
