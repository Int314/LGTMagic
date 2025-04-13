import React from "react";
import JsonLd from "./JsonLd";

interface SiteSeoProps {
  url?: string;
}

const SiteSeo: React.FC<SiteSeoProps> = ({
  url = "https://lgtmagic-pi.vercel.app",
}) => {
  const websiteData = {
    name: "LGTMagic",
    url: url,
    description:
      "LGTM画像を簡単に生成・共有できるツール。あなたの画像から魔法のようにLGTMスタンプを作成しましょう。",
    inLanguage: "ja-JP",
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const organizationData = {
    name: "LGTMagic",
    url: url,
    logo: `${url}/images/logo.svg`,
    sameAs: [
      // ソーシャルメディアリンクがあれば追加
    ],
  };

  return (
    <>
      <JsonLd type="WebSite" data={websiteData} />
      <JsonLd type="Organization" data={organizationData} />
    </>
  );
};

export default SiteSeo;
