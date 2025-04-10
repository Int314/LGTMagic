import React, { useState, useEffect } from "react";
import { ImagePlus, Link as LinkIcon } from "lucide-react";
import { loadImageFromUrl } from "../utils/imageUtils";
import { checkUploadLimitByIp } from "../services/supabase";
import { MAX_FILE_SIZE, DAILY_UPLOAD_LIMIT } from "../utils/constants";

interface UploadFormProps {
  onImageSelected: (imageSource: string) => void;
  addLGTMText: boolean;
  setAddLGTMText: (value: boolean) => void;
  uploadCountUpdated?: number; // アップロード回数更新時に親コンポーネントから渡される値
  isGenerating?: boolean; // 画像生成中のフラグを追加
}

/**
 * 画像アップロードフォームコンポーネント
 * ファイルアップロードとURL入力の両方に対応
 */
const UploadForm: React.FC<UploadFormProps> = ({
  onImageSelected,
  addLGTMText,
  setAddLGTMText,
  uploadCountUpdated = 0, // デフォルト値を設定
  isGenerating = false, // デフォルト値を設定
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [remainingUploads, setRemainingUploads] = useState(DAILY_UPLOAD_LIMIT);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"file" | "url">("file"); // タブ状態を追加

  // 残りのアップロード回数を更新（IPアドレスベース）
  useEffect(() => {
    async function fetchUploadLimits() {
      setIsLoading(true);
      try {
        // IPアドレスベースでの制限をチェック（Supabaseのみ）
        const { limitReached, currentCount, error } =
          await checkUploadLimitByIp();

        if (error) {
          console.warn("IP limit check failed:", error);
          // エラー時はデフォルトの制限を設定
          setRemainingUploads(DAILY_UPLOAD_LIMIT);
        } else {
          // 残りの回数を計算
          setRemainingUploads(Math.max(0, DAILY_UPLOAD_LIMIT - currentCount));
        }
      } catch (err) {
        console.error("Failed to check upload limits:", err);
        // エラー時はデフォルトの制限を設定
        setRemainingUploads(DAILY_UPLOAD_LIMIT);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUploadLimits();
  }, [uploadCountUpdated]); // uploadCountUpdatedが変更されたときに残りのアップロード回数を再取得

  /**
   * ファイルサイズをフォーマットして表示用の文字列を返す
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return bytes + " B";
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルサイズのチェック
    if (file.size > MAX_FILE_SIZE) {
      setError(
        `ファイルサイズが大きすぎます。${formatFileSize(
          file.size
        )}は上限の5MBを超えています。`
      );
      return;
    }

    // エラーをリセット
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        onImageSelected(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;

    setError(null);
    try {
      const corsProxyUrl = await loadImageFromUrl(imageUrl);
      onImageSelected(corsProxyUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "画像の読み込みに失敗しました"
      );
    }
  };

  return (
    <div className="flex flex-col space-y-8 w-full max-w-xs mx-auto">
      {/* タイトルとメッセージ */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
          画像をアップロード
        </h2>
      </div>

      {/* 画像生成中の表示 */}
      {isGenerating && (
        <div className="bg-indigo-600/30 border-2 border-indigo-500/70 text-indigo-200 px-4 py-4 rounded-lg shadow-lg backdrop-blur-sm animate-pulse">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin h-6 w-6 border-2 border-indigo-300 border-t-transparent rounded-full"></div>
            <p className="text-center font-semibold text-base">画像生成中...</p>
          </div>
        </div>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-3 rounded-lg text-sm shadow-lg backdrop-blur-sm animate-pulse">
          <p className="text-center">{error}</p>
        </div>
      )}

      {/* LGTMテキスト追加のチェックボックス */}
      <div className="text-center">
        <label className="flex items-center justify-center gap-2 bg-indigo-900/30 hover:bg-indigo-800/40 transition-colors px-4 py-3 rounded-lg border border-indigo-700/40 cursor-pointer group">
          <input
            type="checkbox"
            id="addLGTMText"
            checked={addLGTMText}
            onChange={(e) => setAddLGTMText(e.target.checked)}
            className="w-4 h-4 text-indigo-600 bg-gray-800 border-gray-600 rounded focus:ring-indigo-500"
          />
          <span className="text-gray-200 group-hover:text-white transition-colors font-medium text-sm">
            画像にLGTMテキストを追加する
          </span>
        </label>
      </div>

      {/* タブセレクター */}
      <div className="flex bg-gray-800/50 rounded-lg p-1 border border-gray-700/40">
        <button
          onClick={() => setActiveTab("file")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "file"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          ファイル選択
        </button>
        <button
          onClick={() => setActiveTab("url")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "url"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          URL入力
        </button>
      </div>

      {/* コンテンツエリア */}
      <div className="space-y-6">
        {/* ファイルアップロードセクション */}
        {activeTab === "file" && (
          <div className="border border-gray-700/50 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300 bg-gradient-to-br from-gray-800/40 to-indigo-900/20 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-5">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="imageInput"
                disabled={remainingUploads <= 0 || isLoading || isGenerating}
              />
              <label
                htmlFor="imageInput"
                className={`cursor-pointer flex flex-col items-center space-y-4 w-full ${
                  remainingUploads <= 0 || isLoading || isGenerating
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105 transition-transform"
                }`}
              >
                <div className="w-20 h-20 rounded-full bg-indigo-600/20 flex items-center justify-center border-2 border-dashed border-indigo-500/60 group-hover:border-indigo-400">
                  <ImagePlus className="w-10 h-10 text-indigo-400" />
                </div>
                <div className="text-center">
                  <span className="text-indigo-300 font-medium block">
                    {isLoading
                      ? "読み込み中..."
                      : isGenerating
                      ? "画像生成中..."
                      : remainingUploads > 0
                      ? "クリックして画像を選択"
                      : "本日の上限に達しました"}
                  </span>
                  <span className="text-gray-400 text-xs block mt-1">
                    PNG, JPG, WEBP 形式（5MB以下）
                  </span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* URL入力セクション */}
        {activeTab === "url" && (
          <div className="border border-gray-700/50 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300 bg-gradient-to-br from-gray-800/40 to-indigo-900/20 backdrop-blur-sm">
            <form
              onSubmit={handleUrlSubmit}
              className="flex flex-col items-center space-y-4"
            >
              <div className="w-20 h-20 rounded-full bg-indigo-600/20 flex items-center justify-center border-2 border-dashed border-indigo-500/60">
                <LinkIcon className="w-10 h-10 text-indigo-400" />
              </div>

              <div className="w-full space-y-4">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="画像のURLを入力"
                  className="w-full px-4 py-3 bg-gray-800/80 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  disabled={remainingUploads <= 0 || isLoading || isGenerating}
                />
                <button
                  type="submit"
                  className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                    remainingUploads <= 0 ||
                    isLoading ||
                    !imageUrl ||
                    isGenerating
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={
                    remainingUploads <= 0 ||
                    isLoading ||
                    !imageUrl ||
                    isGenerating
                  }
                >
                  {isLoading
                    ? "読み込み中..."
                    : isGenerating
                    ? "画像生成中..."
                    : remainingUploads > 0
                    ? "URLから生成"
                    : "本日の上限に達しました"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* IPアドレス取得の説明 */}
      <div className="text-left">
        <p className="text-xs text-gray-500">
          ・画像アップロード時にIPアドレスを取得します
          <br />
          ・気分によっては画像を予告なく削除することもあります
        </p>
      </div>

      {/* 残りのアップロード回数 */}
      <div className="bg-gray-800/30 rounded-lg border border-gray-700/30 px-4 py-3 text-center">
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-indigo-400 border-t-transparent rounded-full"></div>
            <p className="text-gray-400 text-sm">アップロード制限を確認中...</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-300 text-sm">本日の残りアップロード回数</p>
            <p className="font-semibold text-lg">
              <span
                className={`${
                  remainingUploads > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {remainingUploads}
              </span>{" "}
              <span className="text-gray-500">/ {DAILY_UPLOAD_LIMIT}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadForm;
