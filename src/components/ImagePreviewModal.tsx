import React, { useRef } from "react";
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
  const { copySuccess, copyToClipboard, copyAsMarkdown } = useLgtmClipboard();

  const handleModalClick = (e: React.MouseEvent) => {
    if (modalRef.current && e.target === modalRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleModalClick}
    >
      {copySuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-[9999]">
          {copySuccess}
        </div>
      )}

      <div className="relative bg-gray-900 rounded-lg p-6 max-w-3xl w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <img
          src={imageUrl}
          alt="Preview"
          className="w-full object-contain rounded-lg mb-6"
          style={{ maxHeight: "70vh" }}
        />

        <div className="flex justify-center gap-4">
          <button
            onClick={() => copyToClipboard(imageUrl)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-200 transition duration-200"
          >
            <Share2 className="w-5 h-5" />
            Copy URL
          </button>

          <button
            onClick={() => copyAsMarkdown(imageUrl)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-200 transition duration-200"
          >
            <Copy className="w-5 h-5" />
            Copy as Markdown
          </button>

          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-200 transition duration-200"
          >
            <ExternalLink className="w-5 h-5" />
            Open in New Tab
          </a>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
