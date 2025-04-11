"use client";

import React, { useRef, useState, useEffect } from "react";
import { generateLGTMImage, canvasToBlob } from "../utils/imageUtils";
import { uploadImage } from "../services/supabase";
import { getRemainingUploads } from "../utils/storageUtils";

// 必要なコールバック関数のインターフェースは残す
interface ImageGeneratorProps {
  selectedImage: string | null;
  addLGTMText: boolean;
  onImageUploaded: () => void;
  onUploadCountUpdated: () => void;
  setSelectedImage: (image: string | null) => void;
  // 新しいコールバックプロパティを追加
  onGenerateStart?: () => void;
  onGenerateEnd?: () => void;
}

/**
 * LGTM画像生成・アップロード用コンポーネント
 */
const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  selectedImage,
  addLGTMText,
  onImageUploaded,
  onUploadCountUpdated,
  setSelectedImage,
  onGenerateStart,
  onGenerateEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 内部で画像の処理状態を追跡
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  // 画像形式と品質の設定は内部的に使用するがUIから削除
  const imageFormat = "image/webp";
  const imageQuality = 0.8;

  // 画像が選択されたらLGTM画像を生成
  useEffect(() => {
    // 新しい画像が選択された場合、または画像が変わった場合のみ処理を実行
    if (
      selectedImage &&
      selectedImage !== processedImage &&
      canvasRef.current
    ) {
      setProcessedImage(selectedImage); // 現在処理中の画像を記録
      generateImage();
    }
  }, [selectedImage, addLGTMText]);

  const generateImage = async () => {
    if (!selectedImage || !canvasRef.current) return;

    setIsGenerating(true);
    if (onGenerateStart) onGenerateStart(); // 親コンポーネントに生成開始を通知
    setError(null);

    try {
      await generateLGTMImage(canvasRef.current, selectedImage, addLGTMText);
      await uploadGeneratedImage();
    } catch (err) {
      console.error("Error generating image:", err);
      setError(err instanceof Error ? err.message : "画像の生成に失敗しました");
    } finally {
      setIsGenerating(false);
      if (onGenerateEnd) onGenerateEnd(); // 親コンポーネントに生成終了を通知
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
        // アップロード回数が更新されたことを親コンポーネントに通知
        onUploadCountUpdated?.();

        // アップロード完了後、selectedImageをリセットして次の画像選択を可能にする
        if (setSelectedImage) {
          setTimeout(() => {
            setSelectedImage(null);
            setProcessedImage(null);
          }, 100); // 少し遅延を入れて状態の更新が確実に反映されるようにする
        }
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
    </div>
  );
};

export default ImageGenerator;
