import React, { useState, useEffect } from "react";
import Gallery from "./components/Gallery";
import ImagePreviewModal from "./components/ImagePreviewModal";
import UploadForm from "./components/UploadForm";
import ImageGenerator from "./components/ImageGenerator";
import { fetchGalleryImages } from "./services/supabase";

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addLGTMText, setAddLGTMText] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadCountUpdated, setUploadCountUpdated] = useState(0);

  // ギャラリー画像を読み込む
  useEffect(() => {
    loadGalleryImages();
  }, []);

  // Escキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && previewImage) {
        setPreviewImage(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [previewImage]);

  // ギャラリー画像をロードする
  const loadGalleryImages = async () => {
    setIsLoading(true);
    setError(null);

    const { imageUrls, error: fetchError } = await fetchGalleryImages();

    if (fetchError) {
      setError(fetchError);
    }

    setGalleryImages(imageUrls);
    setIsLoading(false);
  };

  // アップロード回数が更新された時のハンドラー
  const handleUploadCountUpdated = () => {
    setUploadCountUpdated((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex flex-col">
      {/* ヘッダー */}
      <header className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 py-6 shadow-xl relative overflow-hidden">
        {/* 背景要素 */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-yellow-300 blur-2xl"></div>
          <div className="absolute top-1/3 right-1/3 w-32 h-32 rounded-full bg-blue-400 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-20 h-20 rounded-full bg-purple-500 blur-2xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 pb-1">
            LGTMagic
          </h1>
          <p className="text-base text-blue-100 mt-2 font-medium tracking-wide">
            Transform your images into magical LGTM stamps ✨
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* 左側のアップロードフォーム */}
        <div className="w-full md:w-1/5 lg:w-1/4 bg-gradient-to-b from-gray-800/80 to-gray-900/90 backdrop-blur-md p-6 md:p-8 overflow-y-auto border-r border-gray-700/30">
          <UploadForm
            onImageSelected={setSelectedImage}
            addLGTMText={addLGTMText}
            setAddLGTMText={setAddLGTMText}
            uploadCountUpdated={uploadCountUpdated}
          />
        </div>

        {/* 右側のギャラリーとプレビュー */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-gradient-to-b from-slate-900/60 to-indigo-950/60 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-6 py-4 rounded-xl mb-8 shadow-lg backdrop-blur-sm">
                <p className="text-center">{error}</p>
              </div>
            )}

            {/* プレビューモーダル */}
            {previewImage && (
              <ImagePreviewModal
                imageUrl={previewImage}
                onClose={() => setPreviewImage(null)}
              />
            )}

            {/* ギャラリーセクション */}
            <Gallery
              isLoading={isLoading}
              images={galleryImages}
              onImageClick={setPreviewImage}
            />

            {/* 画像生成 */}
            <ImageGenerator
              selectedImage={selectedImage}
              addLGTMText={addLGTMText}
              onImageUploaded={loadGalleryImages}
              onUploadCountUpdated={handleUploadCountUpdated}
              setSelectedImage={setSelectedImage}
            />
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-slate-900/80 backdrop-blur-sm py-4 border-t border-gray-800/60">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-400">
          <p>LGTMagic © 2025 - Create and share LGTM images instantly</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
