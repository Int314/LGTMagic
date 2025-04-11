# LGTMagic

LGTMagic は、画像を簡単に LGTM（Looks Good To Me）スタンプに変換できるウェブアプリケーションです。画像をアップロードするだけで、LGTM 文字入りの画像を生成し、ギャラリーに共有することができます。

![LGTMagic](https://example.com/lgtmagic-screenshot.png)

## 機能

- 画像のアップロードと LGTM 画像生成
- ワンクリックで LGTM 画像の作成と共有
- 生成された LGTM 画像のギャラリー表示
- 画像への LGTM テキスト追加オプション
- 管理者モードによるコンテンツ管理
- レスポンシブデザイン対応
- IP アドレスベースのアップロード制限

## 技術スタック

- **フロントエンド**:

  - React 18
  - TypeScript
  - Tailwind CSS
  - Lucide React（アイコン）
  - Vite（ビルドツール）

- **バックエンド**:
  - Supabase（データストレージ、認証、ファイルストレージ）
  - Deno Edge Functions（画像分析機能）

## アーキテクチャ

LGTMagic は、クライアントサイド主体の SPA として設計されています。ユーザーインターフェースと基本的な画像処理はブラウザ上で行われ、画像の保存とギャラリー機能に Supabase を使用しています。

### データフロー

1. ユーザーが画像をアップロード
2. クライアント側で画像に LGTM テキストを追加
3. 処理済み画像が Supabase のストレージに保存
4. アップロード制限が Supabase のデータベースで管理
5. ギャラリー画像は Supabase から取得し表示

### セキュリティ機能

- 不適切なコンテンツの検出（Deno Edge Function）
- IP アドレスベースのアップロード制限
- 管理者モードによるコンテンツモデレーション

## セットアップ方法

### 前提条件

- Node.js 18 以上
- Supabase アカウント

### インストール手順

1. リポジトリのクローン:

```bash
git clone https://github.com/yourusername/lgtm-image-generator.git
cd lgtm-image-generator
```

2. 依存関係のインストール:

```bash
npm install
```

3. 環境変数の設定:
   `.env.local`ファイルを作成し、以下の変数を設定:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ADMIN_PASSWORD_HASH=optional-admin-password-hash
```

4. 開発サーバーの起動:

```bash
npm run dev
```

5. ビルド:

```bash
npm run build
```

### Supabase セットアップ

1. Supabase プロジェクトを作成
2. 以下のテーブルを作成:

   - `upload_limits`: IP アドレスと 1 日のアップロード回数を追跡
   - SQL マイグレーションは`supabase/migrations`ディレクトリを参照

3. Edge Functions のデプロイ:

```bash
supabase functions deploy analyze-image
```

## 開発情報

### プロジェクト構造

```
lgtm-image-generator/
├── public/             # 静的ファイル
├── src/                # ソースコード
│   ├── components/     # Reactコンポーネント
│   ├── hooks/          # カスタムReactフック
│   ├── pages/          # ページコンポーネント
│   ├── services/       # APIサービス（Supabase連携など）
│   └── utils/          # ユーティリティ関数
├── supabase/           # Supabase設定とDenoエッジ関数
└── ...                 # 設定ファイル
```

### 主要コンポーネント

- **App.tsx**: アプリケーションのメインコンポーネント
- **ImageGenerator.tsx**: LGTM 画像の生成処理
- **UploadForm.tsx**: 画像アップロードフォーム
- **Gallery.tsx**: アップロードされた画像のギャラリー表示
- **AdminPasswordModal.tsx**: 管理者認証モーダル

### 機能拡張のヒント

- 新しい画像効果の追加: `src/utils/imageUtils.ts`を編集
- ユーザー認証の追加: Supabase Auth を活用
- 画像タグ付け機能: Supabase データベースにタグテーブルを追加

## デプロイ

1. [Vercel](https://vercel.com/)や[Netlify](https://netlify.com/)にデプロイ可能
2. 環境変数を設定（Supabase URL とキー）
3. ビルドコマンド: `npm run build`
4. 公開ディレクトリ: `dist`

## ライセンス

MIT

## 作者

Your Name
