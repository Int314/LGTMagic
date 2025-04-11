"use client";

import React, { useRef, useEffect } from "react";
import { X, Share2, Copy, ExternalLink, Trash2 } from "lucide-react";
import { useLgtmClipboard } from "../hooks/useClipboard";
import ReactDOM from "react-dom";
import { supabase } from "../services/supabase";
import Image from "next/image";

interface ImagePreviewModalProps {
  imageUrl: string;
  onClose: () => void;
  isAdminMode?: boolean; // 管理者モードフラグを追加
  onImageDeleted?: () => void; // 画像削除後のコールバック
}

/**
 * 画像プレビュー用のモーダルコンポーネント
 * ReactDOMのポータルを使用して、DOMのルートレベルにレンダリングし、
 * position:fixedの問題を回避します
 */
const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  imageUrl,
  onClose,
  isAdminMode = false, // デフォルト値は非管理者モード
  onImageDeleted,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const { copySuccess, copyToClipboard, copyAsMarkdown } = useLgtmClipboard();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // モーダル表示時にアニメーションを適用
  useEffect(() => {
    if (modalContentRef.current) {
      modalContentRef.current.classList.add("modal-appear");
    }
  }, []);

  const handleModalClick = (e: React.MouseEvent) => {
    if (modalRef.current && e.target === modalRef.current) {
      onClose();
    }
  };

  // 画像のパス部分を抽出する関数
  const extractImagePath = (url: string): string | null => {
    try {
      // URLからファイル名を抽出
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");
      // ファイル名だけを取得（パスの最後の部分）
      const fileName = pathParts[pathParts.length - 1];

      // デバッグ情報をコンソールに出力
      console.log("Image URL:", url);
      console.log("Extracted file name:", fileName);

      if (fileName) {
        return fileName;
      }
      return null;
    } catch (e) {
      console.error("URLの解析に失敗しました:", e);
      return null;
    }
  };

  // 画像を削除する関数
  const handleDeleteImage = async () => {
    if (!isAdminMode || isDeleting) return;

    const imagePath = extractImagePath(imageUrl);
    if (!imagePath) {
      setDeleteError("画像のパス情報を取得できませんでした");
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);

      // Supabaseストレージから画像を削除
      const { error } = await supabase.storage
        .from("lgtm-images")
        .remove([imagePath]);

      if (error) {
        throw error;
      }

      // 削除が完了したら、モーダルを閉じる
      onClose();

      // 親コンポーネントに削除完了を通知
      if (onImageDeleted) {
        onImageDeleted();
      }
    } catch (err) {
      console.error("画像の削除に失敗しました:", err);
      setDeleteError(
        err instanceof Error
          ? `削除に失敗しました: ${err.message}`
          : "画像の削除に失敗しました"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // モーダルの内容
  const modalContent = (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9000]"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        padding: "1rem",
      }}
      onClick={handleModalClick}
    >
      {/* 成功メッセージのフロート通知 */}
      {copySuccess && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-xl z-[9999] animate-fade-in-down flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {copySuccess}
        </div>
      )}

      {/* モーダルコンテンツ */}
      <div
        ref={modalContentRef}
        className="relative bg-gradient-to-br from-gray-900 to-slate-800 rounded-2xl p-6 max-w-3xl w-full border border-gray-700/50 shadow-2xl"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-700/80 p-2 rounded-full transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 画像のコンテナ - 美しい装飾を追加 */}
        <div className="relative mb-6 rounded-xl overflow-hidden shadow-lg border border-gray-700/30">
          {/* 装飾的な背景グラデーション要素 */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 z-0"></div>

          {/* 画像 */}
          <Image
            src={imageUrl}
            alt="LGTM Preview"
            className="w-full object-contain rounded-lg z-10 relative"
            style={{ maxHeight: "60vh", minHeight: "250px" }}
            width={800}
            height={600}
            priority
          />

          {/* 装飾的な光の効果 */}
          <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent blur-sm"></div>
          <div className="absolute bottom-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-purple-400/70 to-transparent blur-sm"></div>
        </div>

        {/* エラーメッセージ */}
        {deleteError && (
          <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-3 rounded-lg text-sm shadow-lg">
            <p className="text-center">{deleteError}</p>
          </div>
        )}

        {/* アクションボタンコンテナ */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => copyToClipboard(imageUrl)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg hover:shadow-lg transition duration-200 font-medium"
          >
            <Share2 className="w-5 h-5" />
            URLをコピー
          </button>

          <button
            onClick={() => copyAsMarkdown(imageUrl)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-lg hover:shadow-lg transition duration-200 font-medium"
          >
            <Copy className="w-5 h-5" />
            Markdownをコピー
          </button>

          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-lg hover:shadow-lg transition duration-200 font-medium"
          >
            <ExternalLink className="w-5 h-5" />
            新しいタブで開く
          </a>

          {/* 管理者モードの場合のみ削除ボタンを表示 */}
          {isAdminMode && (
            <button
              onClick={handleDeleteImage}
              disabled={isDeleting}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-lg hover:shadow-lg transition duration-200 font-medium"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  削除中...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  画像を削除
                </>
              )}
            </button>
          )}
        </div>

        {/* 画像URLの表示 */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm mb-2">画像URL:</p>
          <div className="bg-gray-800 rounded-lg px-4 py-3 text-gray-300 text-sm font-mono break-all border border-gray-700">
            {imageUrl}
          </div>
        </div>
      </div>
    </div>
  );

  // ReactDOM.createPortalを使用してモーダルをbodyの直下にレンダリング
  return ReactDOM.createPortal(modalContent, document.body);
};

export default ImagePreviewModal;
