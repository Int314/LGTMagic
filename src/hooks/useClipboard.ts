import { useState } from "react";

interface UseClipboardOptions {
  /**
   * コピー成功メッセージの表示時間（ミリ秒）
   */
  timeout?: number;
}

interface UseClipboardReturn {
  /**
   * コピー成功/失敗のメッセージ
   */
  copySuccess: string | null;
  /**
   * テキストをクリップボードにコピーする関数
   */
  copyToClipboard: (text: string) => Promise<void>;
}

/**
 * クリップボードへのコピー機能を提供するカスタムフック
 */
export function useClipboard(
  options: UseClipboardOptions = {}
): UseClipboardReturn {
  const { timeout = 2000 } = options;
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess("コピーしました！");
      setTimeout(() => setCopySuccess(null), timeout);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      setCopySuccess("コピーに失敗しました");
    }
  };

  return { copySuccess, copyToClipboard };
}

/**
 * LGTM画像用のクリップボードコピー機能を提供するカスタムフック
 */
export function useLgtmClipboard(
  options: UseClipboardOptions = {}
): UseClipboardReturn & {
  copyAsMarkdown: (url: string) => Promise<void>;
} {
  const { timeout = 2000 } = options;
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const copyToClipboard = async (url: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess("URLをコピーしました！");
      setTimeout(() => setCopySuccess(null), timeout);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      setCopySuccess("コピーに失敗しました");
    }
  };

  const copyAsMarkdown = async (url: string): Promise<void> => {
    try {
      const markdown = `![LGTM](${url})`;
      await navigator.clipboard.writeText(markdown);
      setCopySuccess("Markdownをコピーしました！");
      setTimeout(() => setCopySuccess(null), timeout);
    } catch (err) {
      console.error("Failed to copy markdown to clipboard:", err);
      setCopySuccess("コピーに失敗しました");
    }
  };

  return { copySuccess, copyToClipboard, copyAsMarkdown };
}
