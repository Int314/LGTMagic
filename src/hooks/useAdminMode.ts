import { useState, useEffect } from "react";

/**
 * 管理者モードのセッション有効期限（デフォルト: 30分）
 */
const ADMIN_SESSION_EXPIRY_MS = 30 * 60 * 1000; // 30分

/**
 * 管理者モード用のカスタムフック
 */
export function useAdminMode() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false); // パスワード検証中フラグ

  // ローカルストレージのキー
  const ADMIN_SESSION_KEY = "lgtm_admin_session";
  const ADMIN_EXPIRY_KEY = "lgtm_admin_expiry";

  // コンポーネントマウント時に管理者セッションを確認
  useEffect(() => {
    const checkAdminSession = () => {
      try {
        const expiryTime = localStorage.getItem(ADMIN_EXPIRY_KEY);
        if (!expiryTime) return false;

        const expiry = parseInt(expiryTime, 10);
        const now = Date.now();

        if (now < expiry) {
          // セッションが有効な場合
          return true;
        } else {
          // 期限切れの場合、ローカルストレージをクリア
          localStorage.removeItem(ADMIN_SESSION_KEY);
          localStorage.removeItem(ADMIN_EXPIRY_KEY);
          return false;
        }
      } catch (err) {
        console.error("管理者セッションの確認中にエラーが発生しました:", err);
        return false;
      }
    };

    // 起動時にチェック
    const isAdmin = checkAdminSession();
    setIsAdminMode(isAdmin);
  }, []);

  /**
   * 管理者モードを切り替えるハンドラー
   */
  const toggleAdminMode = () => {
    if (isAdminMode) {
      // すでに管理者モードの場合は、管理者モードをOFF
      setIsAdminMode(false);
      localStorage.removeItem(ADMIN_SESSION_KEY);
      localStorage.removeItem(ADMIN_EXPIRY_KEY);
    } else {
      // 管理者モードでない場合は、パスワードモーダルを表示
      setShowPasswordModal(true);
    }
  };

  /**
   * パスワードを検証するハンドラー - サーバーサイドでの検証を使用
   */
  const checkPassword = async (password: string) => {
    if (isVerifying) return; // 既に検証中なら処理しない

    try {
      setIsVerifying(true);

      // サーバーサイドAPIを呼び出してパスワードを検証
      const response = await fetch("/api/verify-admin-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "サーバーエラーが発生しました");
      }

      const data = await response.json();

      if (data.success) {
        setIsAdminMode(true);
        setPasswordError(null);
        setShowPasswordModal(false);

        // ローカルストレージにセッション情報を保存
        const expiryTime = Date.now() + ADMIN_SESSION_EXPIRY_MS;
        localStorage.setItem(ADMIN_SESSION_KEY, "true");
        localStorage.setItem(ADMIN_EXPIRY_KEY, expiryTime.toString());
      } else {
        setPasswordError("パスワードが正しくありません");
      }
    } catch (error) {
      console.error("パスワード検証中にエラーが発生しました:", error);
      setPasswordError("検証中にエラーが発生しました。再試行してください。");
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * パスワードモーダルを閉じるハンドラー
   */
  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordError(null);
  };

  return {
    isAdminMode,
    showPasswordModal,
    passwordError,
    toggleAdminMode,
    verifyPassword: checkPassword, // 名前を変えてエクスポート
    closePasswordModal,
    isVerifying, // 検証中フラグを追加
  };
}
