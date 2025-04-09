import React, { useRef, useEffect } from "react";
import { X, Share2, Copy, ExternalLink } from "lucide-react";
import { useLgtmClipboard } from "../hooks/useClipboard";

interface ImagePreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}

/**
 * 画像プレビュー用のモーダルコンポーネント
 */
const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  imageUrl,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const { copySuccess, copyToClipboard, copyAsMarkdown } = useLgtmClipboard();

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

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
          <img
            src={imageUrl}
            alt="LGTM Preview"
            className="w-full object-contain rounded-lg z-10 relative"
            style={{ maxHeight: "70vh", minHeight: "300px" }}
          />

          {/* 装飾的な光の効果 */}
          <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent blur-sm"></div>
          <div className="absolute bottom-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-purple-400/70 to-transparent blur-sm"></div>
        </div>

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
        </div>

        {/* 画像URLの表示 */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm mb-2">画像URL:</p>
          <div className="bg-gray-800 rounded-lg px-4 py-2 text-gray-300 text-sm font-mono break-all border border-gray-700">
            {imageUrl}
          </div>
        </div>
      </div>

      {/* アニメーション用のスタイル */}
      <style jsx global>{`
        .modal-appear {
          animation: modalFadeIn 0.3s ease forwards;
        }

        @keyframes modalFadeIn {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ImagePreviewModal;
