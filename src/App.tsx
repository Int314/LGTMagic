"use client";

import React, { useState, useEffect, useRef } from "react";
import Gallery from "./components/Gallery";
import ImagePreviewModal from "./components/ImagePreviewModal";
import UploadSection from "./components/UploadSection";
import AdminPasswordModal from "./components/AdminPasswordModal";
import SiteSeo from "./components/seo/SiteSeo";
import { fetchGalleryImages } from "./services/supabase";
import { useAdminMode } from "./hooks/useAdminMode";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { DAILY_UPLOAD_LIMIT } from "./utils/constants";

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadCountUpdated, setUploadCountUpdated] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [addLGTMText, setAddLGTMText] = useState(true);
  const uploadInfoRef = useRef<HTMLDivElement | null>(null);

  // アップロード情報の状態管理
  const [uploadInfo, setUploadInfo] = useState({
    remainingUploads: DAILY_UPLOAD_LIMIT,
    isLoading: false,
    error: null as string | null,
  });

  // 管理者モード関連のフックを使用（パスワードパラメータを渡さない）
  const {
    isAdminMode,
    showPasswordModal,
    passwordError,
    toggleAdminMode,
    verifyPassword,
    closePasswordModal,
    isVerifying,
  } = useAdminMode();

  // ギャラリー画像を読み込む
  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      try {
        const images = await fetchGalleryImages();
        setGalleryImages(images);
      } catch (err) {
        console.error("Error fetching gallery images:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, [uploadCountUpdated]);

  // 画像アップロード後のリロードハンドラ
  const handleImageUploaded = () => {
    // ギャラリー再読み込み用のカウンターをインクリメント
    setUploadCountUpdated((prev) => prev + 1);
  };

  // ギャラリー画像クリック時のプレビューハンドラ
  const handleImageClick = (url: string) => {
    setPreviewImage(url);
  };

  // モーダルを閉じるハンドラ
  const closePreviewModal = () => {
    setPreviewImage(null);
  };

  // 画像生成開始時のハンドラ
  const handleGenerateStart = () => {
    setIsGenerating(true);
  };

  const handleGenerateEnd = () => {
    setIsGenerating(false);
  };

  // アップロード情報を更新する関数を追加
  const handleUploadInfoUpdate = (info: {
    remainingUploads: number;
    isLoading: boolean;
    error: string | null;
  }) => {
    setUploadInfo(info);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      {/* 構造化データをヘッダに追加 */}
      <SiteSeo />

      <div className="container mx-auto px-4 pt-8 pb-16 flex-grow">
        <header className="mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
              LGTMagic
            </h1>
            <p className="text-gray-400">
              Transform your images into magical LGTM stamps ✨
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            {/* アップロードフォームエリア */}
            <UploadSection
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              addLGTMText={addLGTMText}
              setAddLGTMText={setAddLGTMText}
              isGenerating={isGenerating}
              uploadCountUpdated={uploadCountUpdated}
              onUploadInfoUpdate={handleUploadInfoUpdate}
              onImageUploaded={handleImageUploaded}
              onGenerateStart={handleGenerateStart}
              onGenerateEnd={handleGenerateEnd}
              uploadInfo={uploadInfo}
            />

            {/* X(Twitter)シェアボタン */}
            <div className="mt-6 flex justify-center text-xs">
              <button
                onClick={() => {
                  const shareUrl = encodeURIComponent(window.location.href);
                  const shareText = encodeURIComponent(
                    "LGTMagic - Transform your images into magical LGTM stamps ✨"
                  );
                  window.open(
                    `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`,
                    "_blank",
                    "width=550,height=420"
                  );
                }}
                className="inline-flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-full transition-colors border border-gray-700"
                aria-label="X(Twitter)でシェア"
                title="X(Twitter)でシェア"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  className="text-white"
                  fill="currentColor"
                >
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
                X(Twitter)でシェアする
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            {/* ギャラリーエリア */}
            <Gallery
              isLoading={isLoading}
              images={galleryImages}
              onImageClick={handleImageClick}
              isAdminMode={isAdminMode}
              onImageDeleted={handleImageUploaded}
            />
          </div>
        </div>
      </div>

      {/* フッターエリア */}
      <footer className="mt-auto py-3 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="text-gray-500 text-xs mb-2 sm:mb-0 flex items-center">
              <span>© {new Date().getFullYear()} LGTMagic</span>
              <span className="mx-2 hidden sm:inline">|</span>
              <span className="hidden sm:inline">
                Powered with ❤️ by Open Source
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/Int314/LGTMagic"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1 text-xs"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
                GitHub
              </a>
              <a
                href="https://twitter.com/Int314"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1 text-xs"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
                運営者
              </a>
              <button
                onClick={toggleAdminMode}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                  isAdminMode
                    ? "bg-red-900/70 hover:bg-red-800/80 text-red-200"
                    : "bg-gray-800/80 hover:bg-gray-700/80 text-gray-400 hover:text-gray-300"
                } transition-colors`}
                aria-label={
                  isAdminMode
                    ? "管理者モードを無効にする"
                    : "管理者モードを有効にする"
                }
                title={
                  isAdminMode
                    ? "管理者モードを無効にする"
                    : "管理者モードを有効にする"
                }
              >
                {isAdminMode ? (
                  <>
                    <ShieldCheck size={12} /> 管理者モード
                  </>
                ) : (
                  <>
                    <ShieldOff size={12} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* 画像プレビューモーダル */}
      {previewImage && (
        <ImagePreviewModal
          imageUrl={previewImage}
          onClose={closePreviewModal}
          isAdminMode={isAdminMode}
          onImageDeleted={handleImageUploaded}
        />
      )}

      {/* 管理者パスワードモーダル */}
      {showPasswordModal && (
        <AdminPasswordModal
          onVerify={verifyPassword}
          onClose={closePasswordModal}
          error={passwordError}
          isVerifying={isVerifying}
        />
      )}
    </div>
  );
}

export default App;
