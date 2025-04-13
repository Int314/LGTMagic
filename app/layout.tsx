import React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LGTMagic - LGTM画像生成・共有ツール",
  description:
    "LGTM画像を簡単に生成・共有できるツール。あなたの画像から魔法のようにLGTMスタンプを作成しましょう。",
  keywords: [
    "LGTM",
    "画像生成",
    "スタンプ作成",
    "コードレビュー",
    "GitHub",
    "プログラミング",
  ],
  authors: [{ name: "LGTMagic Team" }],
  creator: "LGTMagic Team",
  publisher: "LGTMagic",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    title: "LGTMagic - LGTM画像生成・共有ツール",
    description:
      "LGTM画像を簡単に生成・共有できるツール。あなたの画像から魔法のようにLGTMスタンプを作成しましょう。",
    url: "https://lgtmagic-pi.vercel.app",
    siteName: "LGTMagic",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "LGTMagic - LGTM画像生成・共有ツール",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LGTMagic - LGTM画像生成・共有ツール",
    description:
      "LGTM画像を簡単に生成・共有できるツール。あなたの画像から魔法のようにLGTMスタンプを作成しましょう。",
    images: ["/images/og-image.jpg"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://lgtmagic-pi.vercel.app",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/images/logo.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
