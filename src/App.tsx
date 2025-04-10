import React, { useState, useEffect } from "react";
import Gallery from "./components/Gallery";
import ImagePreviewModal from "./components/ImagePreviewModal";
import UploadForm from "./components/UploadForm";
import ImageGenerator from "./components/ImageGenerator";
import AdminPasswordModal from "./components/AdminPasswordModal";
import { fetchGalleryImages } from "./services/supabase";
import { useAdminMode } from "./hooks/useAdminMode";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { secureHash } from "./utils/passwordUtils";

// 管理者パスワードをハッシュ化して環境変数から取得
// デフォルトハッシュは環境変数がない場合のフォールバック
// 'lgtm-admin-2025'の安全なSHA-256ハッシュ値
const DEFAULT_HASHED_PASSWORD =
  "5e37528bf76dff3089abcf940f4a927703aa9d446ea25b8acacdcbe0d912d028";
const HASHED_ADMIN_PASSWORD =
  import.meta.env.VITE_ADMIN_PASSWORD_HASH || DEFAULT_HASHED_PASSWORD;

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addLGTMText, setAddLGTMText] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadCountUpdated, setUploadCountUpdated] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // 管理者モード関連のフックを使用
  const {
    isAdminMode,
    showPasswordModal,
    passwordError,
    toggleAdminMode,
    verifyPassword,
    closePasswordModal,
    isVerifying, // 検証中状態を取得
  } = useAdminMode(HASHED_ADMIN_PASSWORD);

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

  // 画像が削除された時のハンドラー
  const handleImageDeleted = () => {
    loadGalleryImages(); // 削除後にギャラリーを再読み込み
  };

  // パスワードをハッシュ化するデバッグ用関数 (開発時に使用)
  const hashPasswordForDebug = async (password: string) => {
    try {
      const hash = await secureHash(password);
      console.log(`Hash for '${password}': ${hash}`);
    } catch (err) {
      console.error("Password hashing failed:", err);
    }
  };

  // 必要に応じて特定の条件でパスワードハッシュをコンソールに出力
  useEffect(() => {
    // 開発環境でのみ使用し、本番環境では無効化
    // この関数は開発時にのみコメントを外して使用
    // hashPasswordForDebug("your-password-here");
  }, []);

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
            isGenerating={isGenerating}
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

            {/* 管理者モード状態表示 - 管理者モード時のみ表示 */}
            {isAdminMode && (
              <div className="bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 px-6 py-4 rounded-xl mb-8 shadow-lg backdrop-blur-sm flex items-center justify-center gap-3">
                <ShieldCheck size={20} className="text-indigo-400" />
                <p className="text-center">管理者モード有効</p>
              </div>
            )}

            {/* プレビューモーダル */}
            {previewImage && (
              <ImagePreviewModal
                imageUrl={previewImage}
                onClose={() => setPreviewImage(null)}
                isAdminMode={isAdminMode}
                onImageDeleted={handleImageDeleted}
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
              onGenerateStart={() => setIsGenerating(true)}
              onGenerateEnd={() => setIsGenerating(false)}
            />
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-slate-900/80 backdrop-blur-sm py-4 border-t border-gray-800/60">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center text-sm">
          <p className="text-gray-400">
            LGTMagic © 2025 - Create and share LGTM images instantly
          </p>

          {/* 管理者モード切り替えボタン */}
          <button
            onClick={toggleAdminMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              isAdminMode
                ? "bg-indigo-600/40 hover:bg-indigo-500/40 text-indigo-300"
                : "bg-gray-800/60 hover:bg-gray-700/60 text-gray-400 hover:text-gray-300"
            }`}
            title={
              isAdminMode ? "管理者モードを終了" : "管理者モードへ切り替え"
            }
          >
            {isAdminMode ? (
              <>
                <ShieldOff size={16} />
                <span>管理者モード終了</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>管理者モード</span>
              </>
            )}
          </button>
        </div>
      </footer>

      {/* 管理者パスワードモーダル - isVerifying を渡す */}
      {showPasswordModal && (
        <AdminPasswordModal
          onClose={closePasswordModal}
          onSubmit={verifyPassword}
          error={passwordError}
          isVerifying={isVerifying}
        />
      )}
    </div>
  );
}

export default App;
