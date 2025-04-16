# LGTMagic

![og-image](/public/images/og-image.jpg)

LGTMagic は、画像を簡単に LGTM（Looks Good To Me）スタンプに変換できるウェブアプリケーションです。

画像をアップロードするだけで、LGTM 文字入りの画像を生成し、ギャラリーに共有することができます。

🌐 **デモサイト**: [https://lgtmagic-pi.vercel.app/](https://lgtmagic-pi.vercel.app/)

## 📸 スクリーンショット

![LGTMagic メイン画面](/public/images/screenshot-main.png)
_メイン画面: 画像アップロードと画像一覧_

![LGTMagic モーダル](/public/images/screenshot-modal.png)
_モーダル画面: 生成された LGTM 画像_

## 💫 機能

- 📷 画像のアップロードと LGTM 文字の追加
- 🔠 テキスト表示のカスタマイズ（フォント、色、透明度など）
- 🖼️ 生成した画像のギャラリー表示
- 📋 画像 URL のクリップボードコピー（Markdown 形式も可能）
- 🔒 管理者モードによる画像管理
- 🛡️ 不適切コンテンツの検出とフィルタリング
- 📊 IP アドレスベースのアップロード回数制限

## 🚀 インストール方法

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/lgtm-image-generator.git
cd lgtm-image-generator

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## ⚙️ 環境設定

1. `.env.local` ファイルをプロジェクトのルートディレクトリに作成

2. Supabase プロジェクトを設定

- Supabase でプロジェクトを作成
- ストレージバケットを設定（`images`バケットを作成）
- マイグレーションを実行: `npx supabase migration up`

## 🛠️ 技術スタック

- [Next.js](https://nextjs.org/) - React フレームワーク (v15.3.0)
- [React](https://reactjs.org/) - UI ライブラリ (v19.1.0)
- [TypeScript](https://www.typescriptlang.org/) - 型付き言語
- [Tailwind CSS](https://tailwindcss.com/) - スタイリング
- [Supabase](https://supabase.com/) - バックエンドサービス（ストレージとデータベース）
- [Lucide React](https://lucide.dev/) - アイコンライブラリ

## 📝 使い方

1. 画像をアップロードするか、URL を指定する
2. テキスト設定パネルで表示内容をカスタマイズ
   - 「LGTM」テキストの表示/非表示
   - フォントの種類や色を選択
   - 「Looks Good To Me」の表示/非表示と設定
   - 背景の表示設定（色や透明度）
3. 「この設定でアップロード」ボタンをクリックして画像を生成・共有
4. 生成された画像はギャラリーに表示され、URL をコピーして共有できます

## 📜 ライセンス

MIT

## 👨‍💻 作者

[Int314](https://github.com/Int314)
