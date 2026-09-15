import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SITE_CONFIG } from "@/lib/site-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// 모노 폰트는 본문 코드 블록에서만 쓰이는데 기본값으로 프리로드하면 모든 페이지에서 LCP 이미지와
// 대역폭을 다툰다(Task 014 Lighthouse). 필요할 때 내려받도록 프리로드만 끈다
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  // og:image 같은 절대 URL 메타의 기준. 비워 두면 Vercel 이 배포별 URL 을 추측해 프로덕션 도메인이 아닐 수 있다
  metadataBase: new URL(SITE_CONFIG.siteUrl),
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
  openGraph: {
    siteName: SITE_CONFIG.name,
    locale: "ko_KR",
    type: "website",
  },
  // twitter:image 파일은 따로 두지 않는다 — X 는 없으면 og:image 로 대체한다
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
