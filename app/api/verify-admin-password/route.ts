import { NextResponse } from "next/server";

/**
 * パスワード検証用のAPIエンドポイント
 * POSTリクエストでパスワードを受け取り、サーバーサイドで検証を行います
 */
export async function POST(request: Request) {
  // サーバーコンソールにはっきりと表示されるように
  console.log("==== パスワード検証API ====");
  console.log("リクエスト時刻:", new Date().toISOString());
  console.log("リクエストURL:", request.url);

  try {
    // リクエストの内容をデバッグ
    const contentType = request.headers.get("content-type");
    console.log("Content-Type:", contentType);

    // レスポンスヘッダーにデバッグ情報を含める
    const headers = {
      "X-Debug-Info": "API Called",
    };

    // リクエストボディからパスワードを取得
    let body;
    try {
      body = await request.json();
      console.log(
        "リクエストボディの解析成功:",
        body ? "データあり" : "データなし"
      );
    } catch (e) {
      console.error("リクエストボディの解析に失敗:", e);
      return NextResponse.json(
        { success: false, message: "不正なリクエスト形式" },
        { status: 400, headers }
      );
    }

    const { password } = body || {};

    // パスワードの先頭と末尾のみ表示して機密性を保持
    const maskedPassword = password
      ? `${password.substring(0, 2)}...${password.substring(
          password.length - 2
        )}`
      : "undefined";
    console.log("受信したパスワード(マスク):", maskedPassword);
    console.log("パスワードのタイプ:", typeof password);

    if (!password) {
      console.log("❌ パスワードが提供されていません");
      return NextResponse.json(
        { success: false, message: "パスワードが提供されていません" },
        { status: 400, headers }
      );
    }

    // 環境変数から生の管理者パスワードを取得
    const storedPassword = process.env.ADMIN_PASSWORD;

    // 保存されたパスワードも同様にマスク
    const maskedStoredPassword = storedPassword
      ? `${storedPassword.substring(0, 2)}...${storedPassword.substring(
          storedPassword.length - 2
        )}`
      : "undefined";
    console.log("環境変数 ADMIN_PASSWORD(マスク):", maskedStoredPassword);
    console.log("環境変数のタイプ:", typeof storedPassword);

    // 利用可能な環境変数を確認
    const envKeys = Object.keys(process.env)
      .filter((key) => !key.includes("NODE") && !key.includes("npm"))
      .join(", ");
    console.log("利用可能な環境変数:", envKeys || "なし");

    if (!storedPassword) {
      console.error("❌ 管理者パスワードが環境変数に設定されていません");
      return NextResponse.json(
        { success: false, message: "サーバー設定エラー" },
        { status: 500, headers }
      );
    }

    // パスワードを直接比較
    const isValid = password === storedPassword;
    console.log("パスワード比較結果:", isValid ? "✅ 一致" : "❌ 不一致");

    // 結果を返す
    console.log("==== 検証完了 ====");
    return NextResponse.json({ success: isValid }, { headers });
  } catch (error) {
    console.error("❌ パスワード検証中にエラーが発生しました:", error);
    return NextResponse.json(
      { success: false, message: "検証中にエラーが発生しました" },
      { status: 500, headers: { "X-Debug-Info": "Error Occurred" } }
    );
  }
}

// OPTIONSリクエストに対応 (CORSの事前フライトリクエスト用)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
