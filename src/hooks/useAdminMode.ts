import { useState, useEffect } from "react";
import { verifyPassword } from "../utils/passwordUtils";

/**
 * 管理者モードのセッション有効期限（デフォルト: 30分）
 */
const ADMIN_SESSION_EXPIRY_MS = 30 * 60 * 1000; // 30分

/**
 * 管理者モード用のカスタムフック
 * @param hashedAdminPassword ハッシュ化された管理者パスワード
 */
export function useAdminMode(hashedAdminPassword: string) {
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
   * パスワードを検証するハンドラー - SHA-256ハッシュ比較を使用
   */
  const checkPassword = async (password: string) => {
    if (isVerifying) return; // 既に検証中なら処理しない

    try {
      setIsVerifying(true);

      // 非同期のパスワード検証
      const isValid = await verifyPassword(password, hashedAdminPassword);

      if (isValid) {
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
