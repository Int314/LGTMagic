import React from "react";
import UploadForm from "./UploadForm";
import ImageGenerator from "./ImageGenerator";
import { DAILY_UPLOAD_LIMIT } from "../utils/constants";

interface UploadSectionProps {
  selectedImage: string | null;
  setSelectedImage: (image: string | null) => void;
  addLGTMText: boolean;
  setAddLGTMText: (add: boolean) => void;
  isGenerating: boolean;
  uploadCountUpdated: number;
  onUploadInfoUpdate: (info: {
    remainingUploads: number;
    isLoading: boolean;
    error: string | null;
  }) => void;
  onImageUploaded: () => void;
  onGenerateStart: () => void;
  onGenerateEnd: () => void;
  uploadInfo: {
    remainingUploads: number;
    isLoading: boolean;
    error: string | null;
  };
}

const UploadSection: React.FC<UploadSectionProps> = ({
  selectedImage,
  setSelectedImage,
  addLGTMText,
  setAddLGTMText,
  isGenerating,
  uploadCountUpdated,
  onUploadInfoUpdate,
  onImageUploaded,
  onGenerateStart,
  onGenerateEnd,
  uploadInfo,
}) => {
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      {/* 1. 画像をアップロード テキスト */}
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
          画像をアップロード
        </h2>
      </div>

      {/* 2. ファイル、URL選択タブと3. ファイル、URL入力欄 */}
      <div className="mb-6">
        <UploadForm
          onImageSelected={setSelectedImage}
          addLGTMText={addLGTMText}
          setAddLGTMText={setAddLGTMText}
          isGenerating={isGenerating}
          uploadCountUpdated={uploadCountUpdated}
          onUploadInfoUpdate={onUploadInfoUpdate}
        />
      </div>

      {/* 4. テキスト設定、5. プレビュー、6. アップロードボタン */}
      {selectedImage && (
        <div className="mt-8 pt-6 border-t border-gray-700">
          <ImageGenerator
            selectedImage={selectedImage}
            addLGTMText={addLGTMText}
            onImageUploaded={onImageUploaded}
            onUploadCountUpdated={onImageUploaded}
            setSelectedImage={setSelectedImage}
            onGenerateStart={onGenerateStart}
            onGenerateEnd={onGenerateEnd}
            setAddLGTMText={setAddLGTMText}
          />
        </div>
      )}

      {/* 7. 注釈 */}
      <div className="mt-8 text-left">
        <p className="text-xs text-gray-500">
          ・画像アップロード時にIPアドレスを取得します
          <br />
          ・運営者の気分によって画像を削除することがあります
        </p>
      </div>

      {/* 8. 残りアップロード回数 */}
      <div className="mt-4 bg-gray-800/30 rounded-lg border border-gray-700/30 px-4 py-3 text-center">
        {uploadInfo.isLoading ? (
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
                  uploadInfo.remainingUploads > 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {uploadInfo.remainingUploads}
              </span>{" "}
              <span className="text-gray-500">/ {DAILY_UPLOAD_LIMIT}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadSection;
