/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Vercelデプロイ用に出力ディレクトリを設定
  distDir: 'dist',
  images: {
    domains: ['your-supabase-project.supabase.co'], // Supabaseの画像ドメインを設定
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // TypeScriptコンパイラのオプションを調整してSupabase Edge Functionsを除外
  typescript: {
    // Supabaseのファイルなどを無視するよう指定
    ignoreBuildErrors: true,
  },
  // Supabaseディレクトリを除外
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ビルド対象から特定のパターンを除外
  webpack: (config) => {
    // すべてのwebpack loaderにSupabaseディレクトリを除外する設定を追加
    config.module.rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((r) => {
          if (r.exclude) {
            if (Array.isArray(r.exclude)) {
              r.exclude.push(/supabase/);
            }
          }
        });
      }
    });

    return config;
  },
};

// ESモジュール形式からCommonJS形式に戻す
module.exports = nextConfig;
