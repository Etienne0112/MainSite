import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://etienne0112.github.io"),
  title: "Everything of My Workspace — Site Directory",
  description: "DesertRose's Blog, Study Archive와 앞으로 생길 작업 공간을 한데 모은 개인 사이트 디렉터리.",
  alternates: {
    canonical: "/MainSite/",
  },
  openGraph: {
    type: "website",
    url: "/MainSite/",
    siteName: "Everything of My Workspace",
    title: "Everything of My Workspace",
    description: "One entrance for every place I build.",
    images: [
      {
        url: "/MainSite/og-04.png",
        width: 1536,
        height: 1024,
        alt: "Everything of My Workspace — 04 live, 16 planned, 20 total",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Everything of My Workspace",
    description: "One entrance for every place I build.",
    images: ["/MainSite/og-04.png"],
  },
  icons: {
    icon: "/MainSite/favicon.png",
    shortcut: "/MainSite/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#f1efe8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
