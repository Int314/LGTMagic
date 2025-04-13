import { NextResponse } from "next/server";
// secureHashは不要になるため削除
// import { secureHash } from "@/utils/passwordUtils";

/**
 * パスワード検証用のAPIエンドポイント
 * POSTリクエストでパスワードを受け取り、サーバーサイドで検証を行います
 */
export async function POST(request: Request) {
  try {
    // リクエストボディからパスワードを取得
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, message: "パスワードが提供されていません" },
        { status: 400 }
      );
    }

    console.log(password);

    // 環境変数から生の管理者パスワードを取得
    const storedPassword = process.env.ADMIN_PASSWORD;

    console.log(storedPassword);

    if (!storedPassword) {
      console.error("管理者パスワードが環境変数に設定されていません");
      return NextResponse.json(
        { success: false, message: "サーバー設定エラー" },
        { status: 500 }
      );
    }

    // パスワードを直接比較
    const isValid = password === storedPassword;

    // 結果を返す
    return NextResponse.json({ success: isValid });
  } catch (error) {
    console.error("パスワード検証中にエラーが発生しました:", error);
    return NextResponse.json(
      { success: false, message: "検証中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
