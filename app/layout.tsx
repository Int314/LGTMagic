import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LGTMagic",
  description: "LGTM画像を簡単に生成・共有できるツール",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
