import { NextResponse } from "next/server";

/**
 * パスワード検証用のAPIエンドポイント
 * POSTリクエストでパスワードを受け取り、サーバーサイドで検証を行います
 */
export async function POST(request: Request) {
  console.log("==== パスワード検証API ====");

  try {
    // レスポンスヘッダーを設定
    const headers = {
      "X-Debug-Info": "API Called",
    };

    // リクエストボディからパスワードを取得
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error("リクエストボディの解析に失敗:", e);
      return NextResponse.json(
        { success: false, message: "不正なリクエスト形式" },
        { status: 400, headers }
      );
    }

    const { password } = body || {};

    if (!password) {
      console.log("❌ パスワードが提供されていません");
      return NextResponse.json(
        { success: false, message: "パスワードが提供されていません" },
        { status: 400, headers }
      );
    }

    // 環境変数から生の管理者パスワードを取得
    const storedPassword = process.env.ADMIN_PASSWORD;

    if (!storedPassword) {
      console.error("❌ 管理者パスワードが環境変数に設定されていません");
      return NextResponse.json(
        { success: false, message: "サーバー設定エラー" },
        { status: 500, headers }
      );
    }

    // パスワードを直接比較
    const isValid = password === storedPassword;

    // 結果を返す
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
