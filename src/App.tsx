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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [addLGTMText, setAddLGTMText] = useState(true);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">LGTMagic</h1>
        <p className="text-gray-400 text-center mb-8">
          画像を魔法のようにLGTMスタンプに変換
        </p>

        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-8">
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

        <div className="space-y-12">
          {/* アップロードセクション */}
          <UploadForm
            onImageSelected={setSelectedImage}
            addLGTMText={addLGTMText}
            setAddLGTMText={setAddLGTMText}
          />

          {/* 画像生成プレビュー */}
          <ImageGenerator
            selectedImage={selectedImage}
            addLGTMText={addLGTMText}
            onImageUploaded={loadGalleryImages}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
