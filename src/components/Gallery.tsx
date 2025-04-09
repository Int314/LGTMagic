import React, { useEffect } from "react";

interface GalleryProps {
  isLoading: boolean;
  images: string[];
  onImageClick: (url: string) => void;
}

/**
 * 画像ギャラリーを表示するコンポーネント
 */
const Gallery: React.FC<GalleryProps> = ({
  isLoading,
  images,
  onImageClick,
}) => {
  useEffect(() => {
    console.log("Gallery component rendered with", images.length, "images");
  }, [images]);

  return (
    <div className="space-y-8 mb-16">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200">
          Recent LGTM Images
        </h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="relative w-20 h-20">
            {/* 複数の円を重ねてアニメーションさせる */}
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-purple-400 animate-spin"></div>
            <div
              className="absolute inset-1 rounded-full border-4 border-t-transparent border-pink-400 animate-spin"
              style={{ animationDuration: "1.5s" }}
            ></div>
            <div
              className="absolute inset-2 rounded-full border-4 border-t-transparent border-indigo-400 animate-spin"
              style={{ animationDuration: "2s" }}
            ></div>
          </div>
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((url, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl cursor-pointer shadow-lg hover:shadow-2xl bg-gradient-to-br from-gray-800/50 to-indigo-900/30 backdrop-blur-sm border border-gray-700/40"
              onClick={() => onImageClick(url)}
              style={{
                animation: `fadeIn 0.5s ease-out ${index * 0.05}s backwards`,
              }}
            >
              {/* 画像コンテナ - 固定サイズコンテナを使用 */}
              <div className="w-full h-64 overflow-hidden rounded-t-xl">
                <img
                  src={url}
                  alt={`LGTM ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 ease-out will-change-transform transform-gpu group-hover:scale-105"
                  style={{ transformOrigin: "center center" }}
                  loading="lazy"
                />
              </div>

              {/* カード下部のグラデーションオーバーレイ */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent"></div>

              {/* ホバー時のオーバーレイとアイコン */}
              <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <div className="bg-white/20 backdrop-blur-md rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-white"
                  >
                    <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1" />
                  </svg>
                </div>
              </div>

              {/* ラベル表示 */}
              <div className="absolute bottom-2 left-3 text-xs font-medium text-white opacity-80">
                LGTM #{images.length - index}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700/30 backdrop-blur-sm">
          <div className="inline-flex rounded-full bg-gray-700/50 p-4 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </div>
          <p className="text-gray-400 text-lg">画像がまだありません</p>
          <p className="text-gray-500 text-sm mt-2">
            左側のフォームから画像をアップロードしてください
          </p>
        </div>
      )}

      {/* スタイル適用用のグローバルスタイル */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Gallery;
