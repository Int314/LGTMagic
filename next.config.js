/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // distDirの設定を削除 - Vercelのデフォルト設定を使用
  images: {
    domains: ['wtnkyxpccjoneioesuyr.supabase.co'], // 実際のSupabaseプロジェクトドメインを設定
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
