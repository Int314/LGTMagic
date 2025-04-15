"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  generateLGTMImage,
  canvasToBlob,
  FontSettings,
  DEFAULT_FONT_SETTINGS,
} from "../utils/imageUtils";
import { uploadImage } from "../services/supabase";

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
  setAddLGTMText: (value: boolean) => void;
}

// 利用可能なフォントリスト
const AVAILABLE_FONTS = [
  { name: "Montserrat", value: "'Montserrat', 'Roboto', sans-serif" },
  { name: "Arial", value: "'Arial', sans-serif" },
  { name: "Impact", value: "'Impact', sans-serif" },
  { name: "Comic Sans MS", value: "'Comic Sans MS', cursive" },
  { name: "Georgia", value: "'Georgia', serif" },
  { name: "Courier New", value: "'Courier New', monospace" },
];

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
  setAddLGTMText,
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

  // 設定パネルの表示状態
  const [showSettings, setShowSettings] = useState(false);
  // 設定タブの選択状態
  const [activeTab, setActiveTab] = useState<"lgtm" | "subtext" | "background">(
    "lgtm"
  );

  // フォント設定の状態管理を追加
  const [fontSettings, setFontSettings] = useState<FontSettings>({
    ...DEFAULT_FONT_SETTINGS,
  });

  const uploadGeneratedImage = useCallback(async () => {
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
  }, [
    canvasRef,
    imageFormat,
    imageQuality,
    onImageUploaded,
    onUploadCountUpdated,
    setProcessedImage,
    setSelectedImage,
  ]);

  const generateImage = useCallback(async () => {
    if (!selectedImage || !canvasRef.current) return;

    setIsGenerating(true);
    if (onGenerateStart) onGenerateStart(); // 親コンポーネントに生成開始を通知
    setError(null);

    try {
      await generateLGTMImage(
        canvasRef.current,
        selectedImage,
        addLGTMText,
        fontSettings
      );
      await uploadGeneratedImage();
    } catch (err) {
      console.error("Error generating image:", err);
      setError(err instanceof Error ? err.message : "画像の生成に失敗しました");
    } finally {
      setIsGenerating(false);
      if (onGenerateEnd) onGenerateEnd(); // 親コンポーネントに生成終了を通知
    }
  }, [
    selectedImage,
    canvasRef,
    addLGTMText,
    onGenerateStart,
    onGenerateEnd,
    uploadGeneratedImage,
    fontSettings,
  ]);

  // プレビュー生成（リアルタイムプレビュー用）
  const generatePreview = useCallback(async () => {
    if (!selectedImage || !canvasRef.current) return;

    try {
      await generateLGTMImage(
        canvasRef.current,
        selectedImage,
        addLGTMText,
        fontSettings
      );
    } catch (err) {
      console.error("Error generating preview:", err);
    }
  }, [selectedImage, canvasRef, addLGTMText, fontSettings]);

  // 設定変更時にプレビューを更新
  useEffect(() => {
    if (selectedImage && canvasRef.current) {
      generatePreview();
    }
  }, [fontSettings, selectedImage, generatePreview, addLGTMText]);

  // 画像が選択されたらLGTM画像を生成
  useEffect(() => {
    // 新しい画像が選択された場合、または画像が変わった場合のみ処理を実行
    if (
      selectedImage &&
      selectedImage !== processedImage &&
      canvasRef.current
    ) {
      setProcessedImage(selectedImage); // 現在処理中の画像を記録
      generatePreview(); // 最初はアップロードせずプレビューのみ生成
    }
  }, [selectedImage, addLGTMText, processedImage, generatePreview]);

  // フォント設定を変更するハンドラー
  const handleFontSettingChange = (
    key: keyof FontSettings,
    value: string | number | boolean
  ) => {
    setFontSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
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

      {/* フォント設定パネル */}
      <div className="w-full mb-4">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg mb-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="font-medium">テキスト設定</span>
          <svg
            className={`w-5 h-5 transition-transform ${
              showSettings ? "rotate-180" : ""
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {showSettings && (
          <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow">
            {/* LGTMテキスト追加のチェックボックス */}
            <div className="mb-4">
              <label className="inline-flex items-center cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={addLGTMText}
                  onChange={(e) => setAddLGTMText(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium">
                  画像にLGTMテキストを追加する
                </span>
              </label>
            </div>

            {/* タブナビゲーション */}
            <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "lgtm"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("lgtm")}
              >
                LGTM設定
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "subtext"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("subtext")}
              >
                Looks Good To Me設定
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "background"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("background")}
              >
                背景設定
              </button>
            </div>

            {/* LGTM設定タブパネル */}
            {activeTab === "lgtm" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LGTMテキスト表示切替 */}
                <div className="col-span-1 md:col-span-2 mb-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fontSettings.showMainText}
                      onChange={(e) =>
                        handleFontSettingChange(
                          "showMainText",
                          e.target.checked
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-medium">
                      「LGTM」を表示
                    </span>
                  </label>
                </div>

                {/* メインフォント選択 */}
                {fontSettings.showMainText && (
                  <>
                    <div>
                      <label
                        htmlFor="mainFont"
                        className="block text-sm font-medium mb-1"
                      >
                        「LGTM」のフォント
                      </label>
                      <select
                        id="mainFont"
                        value={fontSettings.mainFont}
                        onChange={(e) =>
                          handleFontSettingChange("mainFont", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                      >
                        {AVAILABLE_FONTS.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* メインテキスト色選択 */}
                    <div>
                      <label
                        htmlFor="mainTextColor"
                        className="block text-sm font-medium mb-1"
                      >
                        テキスト色
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="mainTextColor"
                          type="color"
                          value={
                            fontSettings.mainTextColor?.startsWith("#")
                              ? fontSettings.mainTextColor
                              : "#ffffff"
                          }
                          onChange={(e) =>
                            handleFontSettingChange(
                              "mainTextColor",
                              e.target.value
                            )
                          }
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <span className="text-sm">
                          {fontSettings.mainTextColor}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Looks Good To Me設定タブパネル */}
            {activeTab === "subtext" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* サブテキスト表示切替 */}
                <div className="col-span-1 md:col-span-2 mb-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fontSettings.showSubtext}
                      onChange={(e) =>
                        handleFontSettingChange("showSubtext", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-medium">
                      「Looks Good To Me」を表示
                    </span>
                  </label>
                </div>

                {fontSettings.showSubtext && (
                  <>
                    {/* サブフォント選択 */}
                    <div>
                      <label
                        htmlFor="subFont"
                        className="block text-sm font-medium mb-1"
                      >
                        フォント
                      </label>
                      <select
                        id="subFont"
                        value={fontSettings.subFont}
                        onChange={(e) =>
                          handleFontSettingChange("subFont", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                      >
                        {AVAILABLE_FONTS.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* サブテキスト色選択 */}
                    <div>
                      <label
                        htmlFor="subTextColor"
                        className="block text-sm font-medium mb-1"
                      >
                        テキスト色
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="subTextColor"
                          type="color"
                          value={
                            fontSettings.subTextColor?.startsWith("#")
                              ? fontSettings.subTextColor
                              : "#ffffff"
                          }
                          onChange={(e) =>
                            handleFontSettingChange(
                              "subTextColor",
                              e.target.value
                            )
                          }
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <span className="text-sm">
                          {fontSettings.subTextColor}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 背景設定タブパネル */}
            {activeTab === "background" && (
              <div className="grid grid-cols-1 gap-4">
                {/* 背景表示切替 */}
                <div className="mb-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fontSettings.showBackground}
                      onChange={(e) =>
                        handleFontSettingChange(
                          "showBackground",
                          e.target.checked
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-medium">背景を表示</span>
                  </label>
                </div>

                {/* 背景透明度スライダー */}
                {fontSettings.showBackground && (
                  <>
                    <div>
                      <label
                        htmlFor="bgOpacity"
                        className="block text-sm font-medium mb-1"
                      >
                        背景の透明度:{" "}
                        {Math.round(Number(fontSettings.bgOpacity) * 100)}%
                      </label>
                      <input
                        id="bgOpacity"
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={fontSettings.bgOpacity}
                        onChange={(e) =>
                          handleFontSettingChange(
                            "bgOpacity",
                            Number(e.target.value)
                          )
                        }
                        className="w-full"
                      />
                    </div>

                    {/* 背景色 */}
                    <div>
                      <label
                        htmlFor="bgColor"
                        className="block text-sm font-medium mb-1"
                      >
                        背景色
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="bgColor"
                          type="color"
                          value={
                            fontSettings.bgColor?.startsWith("#")
                              ? fontSettings.bgColor
                              : "#000000"
                          }
                          onChange={(e) =>
                            handleFontSettingChange("bgColor", e.target.value)
                          }
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <span className="text-sm">{fontSettings.bgColor}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* プレビュー画像表示 */}
      <div className="relative">
        <canvas ref={canvasRef} className="w-full rounded-lg shadow-xl" />
        {(isGenerating || isUploading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* 生成ボタン */}
      <div className="flex justify-center">
        <button
          onClick={generateImage}
          disabled={isGenerating || isUploading || !selectedImage}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating
            ? "画像生成中..."
            : isUploading
            ? "アップロード中..."
            : "この設定でアップロード"}
        </button>
      </div>
    </div>
  );
};

export default ImageGenerator;
