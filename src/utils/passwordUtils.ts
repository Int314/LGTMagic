/**
 * パスワードのハッシュ化と検証のためのユーティリティ
 * セキュリティの観点から、より強力なSHA-256アルゴリズムを使用します
 */

/**
 * 文字列をSHA-256でハッシュ化する関数
 * @param str ハッシュ化する文字列
 * @returns Base64エンコードされたハッシュ文字列
 */
export async function secureHash(str: string): Promise<string> {
  // テキストエンコーダを使用して文字列をバイトに変換
  const encoder = new TextEncoder();
  const data = encoder.encode(str);

  // ソルトを追加してセキュリティを高める（ソルトはここでは固定値を使用）
  // 注: 実際の実装ではユーザーごとに異なるソルトを使用することが望ましい
  const salt = "LGTM_MAGIC_SALT_2025";
  const saltedData = encoder.encode(str + salt);

  // SHA-256ハッシュを計算
  const hashBuffer = await crypto.subtle.digest("SHA-256", saltedData);

  // バッファをBase64文字列に変換
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

/**
 * パスワードのハッシュが一致するかチェック
 * @param inputPassword 入力されたパスワード
 * @param storedHash 保存されているハッシュ
 * @returns 一致すればtrue、しなければfalse
 */
export async function verifyPassword(
  inputPassword: string,
  storedHash: string
): Promise<boolean> {
  const inputHash = await secureHash(inputPassword);
  console.log("Input Password:", inputPassword);
  console.log("Input Hash:", inputHash);
  console.log("Stored Hash:", storedHash);
  return inputHash === storedHash;
}
