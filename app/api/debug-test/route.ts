import { NextResponse } from "next/server";

/**
 * デバッグ確認用のテストエンドポイント
 * サーバーサイドのログとレスポンスをテストするためのもの
 */
export async function GET() {
  console.log("==== デバッグテストAPI ====");
  console.log("リクエスト時刻:", new Date().toISOString());
  console.log("これはサーバーサイドのログです");

  // 環境変数のテスト
  console.log(
    "環境変数テスト - ADMIN_PASSWORD設定状態:",
    process.env.ADMIN_PASSWORD ? "設定あり" : "設定なし"
  );

  return NextResponse.json({
    message: "デバッグテスト成功",
    time: new Date().toISOString(),
    envTest: process.env.ADMIN_PASSWORD ? "環境変数あり" : "環境変数なし",
  });
}
