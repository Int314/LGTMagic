"use client";

import React, { useEffect } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "../services/supabase";
import Image from "next/image";

interface GalleryProps {
  isLoading?: boolean;
  images?: string[];
  onImageClick?: (url: string) => void;
  isAdminMode?: boolean; // 管理者モードフラグ
  onImageDeleted?: () => void; // 画像削除後のコールバック
}

/**
 * 画像ギャラリーを表示するコンポーネント
 */
const Gallery: React.FC<GalleryProps> = ({
  isLoading = false,
  images = [],
  onImageClick = () => {},
  isAdminMode = false, // 管理者モードのデフォルト値
  onImageDeleted = () => {}, // 画像削除コールバックのデフォルト値
}) => {
  useEffect(() => {
    console.log(
      "Gallery component rendered with",
      images?.length || 0,
      "images",
      isAdminMode ? "(admin mode)" : ""
    );
  }, [images, isAdminMode]);

  // 画像のファイル名を取得する関数
  const getImageFilename = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");
      // 最後のパス部分がファイル名
      return pathParts[pathParts.length - 1];
    } catch (err) {
      console.error("Failed to parse image URL:", err);
      return "";
    }
  };

  // 画像削除ハンドラー
  const handleDeleteImage = async (e: React.MouseEvent, url: string) => {
    e.stopPropagation(); // 画像クリックイベントの伝播を停止

    if (!isAdminMode) return;

    const confirmDelete = window.confirm("この画像を削除しますか？");
    if (!confirmDelete) return;

    try {
      const filename = getImageFilename(url);
      if (!filename) {
        throw new Error("ファイル名が取得できませんでした");
      }

      const { error } = await supabase.storage
        .from("lgtm-images")
        .remove([filename]);

      if (error) {
        throw error;
      }

      // 親コンポーネントに通知（ギャラリー再読み込み）
      onImageDeleted();
    } catch (err) {
      console.error("Error deleting image:", err);
      alert("画像の削除中にエラーが発生しました");
    }
  };

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
      ) : images && images.length > 0 ? (
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
              <div className="w-full aspect-square overflow-hidden rounded-t-xl">
                <Image
                  src={url}
                  alt={`LGTM ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 ease-out will-change-transform transform-gpu group-hover:scale-105"
                  style={{ transformOrigin: "center center" }}
                  width={400}
                  height={400}
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

              {/* 管理者モードの場合のみ削除ボタンを表示 */}
              {isAdminMode && (
                <button
                  onClick={(e) => handleDeleteImage(e, url)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-90 hover:opacity-100 transition-all z-10"
                  title="画像を削除"
                >
                  <Trash2 size={16} />
                </button>
              )}

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
    </div>
  );
};

export default Gallery;
