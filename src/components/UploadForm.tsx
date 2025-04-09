import React, { useState } from "react";
import { ImagePlus, Link as LinkIcon } from "lucide-react";
import { loadImageFromUrl } from "../utils/imageUtils";

interface UploadFormProps {
  onImageSelected: (imageSource: string) => void;
  addLGTMText: boolean;
  setAddLGTMText: (value: boolean) => void;
}

/**
 * 画像アップロードフォームコンポーネント
 * ファイルアップロードとURL入力の両方に対応
 */
const UploadForm: React.FC<UploadFormProps> = ({
  onImageSelected,
  addLGTMText,
  setAddLGTMText,
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

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
            />
            <label
              htmlFor="imageInput"
              className="cursor-pointer flex flex-col items-center space-y-4"
            >
              <ImagePlus className="w-12 h-12 text-gray-400" />
              <span className="text-gray-400">
                クリックしてアップロードするか、画像をドラッグ＆ドロップ
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
              >
                URLから生成
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UploadForm;
