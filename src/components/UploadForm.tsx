import React, { useState, useEffect } from "react";
import { ImagePlus, Link as LinkIcon } from "lucide-react";
import { loadImageFromUrl } from "../utils/imageUtils";
import { getRemainingUploads, DAILY_UPLOAD_LIMIT } from "../utils/storageUtils";
import { checkUploadLimitByIp } from "../services/supabase";

interface UploadFormProps {
  onImageSelected: (imageSource: string) => void;
  addLGTMText: boolean;
  setAddLGTMText: (value: boolean) => void;
  uploadCountUpdated?: number; // アップロード回数更新時に親コンポーネントから渡される値
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
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [remainingUploads, setRemainingUploads] = useState(DAILY_UPLOAD_LIMIT);
  const [isLoading, setIsLoading] = useState(true);

  // 残りのアップロード回数を更新（IPアドレスベース）
  useEffect(() => {
    async function fetchUploadLimits() {
      setIsLoading(true);
      try {
        // IPアドレスベースでの制限をチェック
        const { limitReached, currentCount, error } =
          await checkUploadLimitByIp();

        if (error) {
          console.warn("IP limit check failed, using local storage:", error);
          // エラー時はローカルストレージにフォールバック
          setRemainingUploads(getRemainingUploads());
        } else {
          // 残りの回数を計算
          setRemainingUploads(Math.max(0, DAILY_UPLOAD_LIMIT - currentCount));
        }
      } catch (err) {
        console.error("Failed to check upload limits:", err);
        // エラー時はローカルストレージにフォールバック
        setRemainingUploads(getRemainingUploads());
      } finally {
        setIsLoading(false);
      }
    }

    fetchUploadLimits();
  }, [uploadCountUpdated]); // uploadCountUpdatedが変更されたときに残りのアップロード回数を再取得

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          onImageSelected(result);
        }
      };
      reader.readAsDataURL(file);
    }
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
    <>
      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-8">
          <p className="text-center">{error}</p>
        </div>
      )}

      {/* 残りのアップロード回数表示 */}
      <div className="mb-6 text-center">
        {isLoading ? (
          <p className="text-gray-400">アップロード制限を確認中...</p>
        ) : (
          <>
            <p className="text-gray-400">
              本日の残りアップロード回数:
              <span
                className={`ml-1 font-semibold ${
                  remainingUploads > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {remainingUploads} / {DAILY_UPLOAD_LIMIT}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              画像アップロード時にIPアドレスを取得しています
            </p>
          </>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* ファイルアップロード */}
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8">
          <div className="flex flex-col items-center space-y-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="imageInput"
              disabled={remainingUploads <= 0 || isLoading}
            />
            <label
              htmlFor="imageInput"
              className={`cursor-pointer flex flex-col items-center space-y-4 ${
                remainingUploads <= 0 || isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <ImagePlus className="w-12 h-12 text-gray-400" />
              <span className="text-gray-400">
                {isLoading
                  ? "読み込み中..."
                  : remainingUploads > 0
                  ? "クリックしてアップロードするか、画像をドラッグ＆ドロップ"
                  : "本日のアップロード上限に達しました"}
              </span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="addLGTMText"
                checked={addLGTMText}
                onChange={(e) => setAddLGTMText(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="addLGTMText" className="text-gray-300">
                画像にLGTMテキストを追加する
              </label>
            </div>
          </div>
        </div>

        {/* URL入力 */}
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8">
          <form
            onSubmit={handleUrlSubmit}
            className="flex flex-col items-center space-y-6"
          >
            <LinkIcon className="w-12 h-12 text-gray-400" />
            <div className="w-full max-w-md space-y-4">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="画像のURLを入力"
                className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                disabled={remainingUploads <= 0 || isLoading}
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="addLGTMTextUrl"
                  checked={addLGTMText}
                  onChange={(e) => setAddLGTMText(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="addLGTMTextUrl" className="text-gray-300">
                  画像にLGTMテキストを追加する
                </label>
              </div>
              <button
                type="submit"
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200 ${
                  remainingUploads <= 0 || isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={remainingUploads <= 0 || isLoading}
              >
                {isLoading
                  ? "読み込み中..."
                  : remainingUploads > 0
                  ? "URLから生成"
                  : "本日の上限に達しました"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UploadForm;
