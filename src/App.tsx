"use client";

import React, { useState, useEffect } from "react";
import Gallery from "./components/Gallery";
import ImagePreviewModal from "./components/ImagePreviewModal";
import UploadForm from "./components/UploadForm";
import ImageGenerator from "./components/ImageGenerator";
import AdminPasswordModal from "./components/AdminPasswordModal";
import { fetchGalleryImages } from "./services/supabase";
import { useAdminMode } from "./hooks/useAdminMode";
import { ShieldCheck, ShieldOff } from "lucide-react";

// 管理者パスワードをハッシュ化して環境変数から取得
const HASHED_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH || "";

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadCountUpdated, setUploadCountUpdated] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [addLGTMText, setAddLGTMText] = useState(true);

  // 管理者モード関連のフックを使用
  const {
    isAdminMode,
    showPasswordModal,
    passwordError,
    toggleAdminMode,
    verifyPassword,
    closePasswordModal,
    isVerifying,
  } = useAdminMode(HASHED_ADMIN_PASSWORD);

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

  // 画像生成終了時のハンドラ
  const handleGenerateEnd = () => {
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
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
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              <UploadForm
                onImageSelected={setSelectedImage}
                addLGTMText={addLGTMText}
                setAddLGTMText={setAddLGTMText}
                isGenerating={isGenerating}
                uploadCountUpdated={uploadCountUpdated}
              />

              <div className="mt-8">
                <ImageGenerator
                  selectedImage={selectedImage}
                  addLGTMText={addLGTMText}
                  onImageUploaded={handleImageUploaded}
                  onUploadCountUpdated={handleImageUploaded}
                  setSelectedImage={setSelectedImage}
                  onGenerateStart={handleGenerateStart}
                  onGenerateEnd={handleGenerateEnd}
                />
              </div>
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
      <footer className="mt-auto py-4 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="text-gray-500 text-sm">
            Powered with ❤️ by Open Source
          </div>
          <div>
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
                  <ShieldOff size={12} /> 管理者
                </>
              )}
            </button>
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
