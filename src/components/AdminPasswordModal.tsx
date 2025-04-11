import React, { useState, useRef, useEffect } from "react";
import { X, Lock, LogIn, Loader } from "lucide-react";
import ReactDOM from "react-dom";

interface AdminPasswordModalProps {
  onClose: () => void;
  onVerify: (password: string) => void; // onSubmitをonVerifyに変更
  error?: string | null;
  isVerifying?: boolean; // パスワード検証中フラグを追加
}

/**
 * 管理者パスワード入力用モーダル
 */
const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  onClose,
  onVerify, // onSubmitをonVerifyに変更
  error,
  isVerifying = false, // デフォルト値設定
}) => {
  const [password, setPassword] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // モーダル表示時にアニメーションを適用
  useEffect(() => {
    if (modalContentRef.current) {
      modalContentRef.current.classList.add("modal-appear");
    }

    // 自動フォーカス
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, []);

  // Escキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerifying && password) {
      onVerify(password); // onVerifyを呼び出す
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    if (modalRef.current && e.target === modalRef.current) {
      onClose();
    }
  };

  const modalContent = (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9000]"
      onClick={handleModalClick}
    >
      <div
        ref={modalContentRef}
        className="relative bg-gradient-to-br from-gray-900 to-slate-800 rounded-2xl p-6 max-w-md w-full border border-gray-700/50 shadow-2xl"
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-700/80 p-2 rounded-full transition-colors z-10"
          aria-label="Close modal"
          disabled={isVerifying}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6 flex flex-col items-center">
          <div className="bg-indigo-600/30 p-3 rounded-full mb-4">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">管理者認証</h2>
          <p className="text-gray-400 mt-1">
            画像を管理するには管理者パスワードを入力してください
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-3 rounded-lg text-sm">
            <p className="text-center">{error}</p>
          </div>
        )}

        {/* パスワードフォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              className="w-full px-4 py-3 bg-gray-800/80 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-10"
              required
              disabled={isVerifying}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
              !password || isVerifying ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!password || isVerifying}
          >
            {isVerifying ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                検証中...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                管理者モードへ
              </>
            )}
          </button>
        </form>

        {/* ヘルプテキスト */}
        <p className="mt-6 text-xs text-center text-gray-500">
          管理者モードでは、画像の削除などの操作が可能になります。
          <br />
          パスワードがわからない場合は、サイト管理者に問い合わせてください。
        </p>

        {/* SHA-256セキュリティ情報 */}
        <div className="mt-4 pt-4 border-t border-gray-700/30 flex items-center justify-center gap-2">
          <Lock className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500">
            SHA-256暗号化で保護されています
          </span>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default AdminPasswordModal;
