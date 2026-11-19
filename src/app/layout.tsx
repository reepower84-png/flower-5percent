import type { Metadata, Viewport } from "next";
import { Gowun_Batang, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { SITE } from "@/site.config";

const batang = Gowun_Batang({
  weight: ["400", "700"],
  subsets: ["latin"],
  preload: false,
  display: "swap",
  variable: "--font-batang",
});

const sans = Noto_Sans_KR({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  preload: false,
  display: "swap",
  variable: "--font-sans-ko",
});

export const metadata: Metadata = {
  title: `${SITE.name} | 마지막 한 끗까지 정성을 담는 꽃 · 전국 당일배송`,
  description: `축하화환·근조화환·꽃다발·꽃바구니·관엽화분·동서양란. 마지막 5%의 디테일까지 손으로 매만지는 ${SITE.name}. 전국 당일배송 · 365일 전화 상담 ${SITE.phone}`,
};

export const viewport: Viewport = {
  themeColor: "#f5efe2",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`h-full antialiased ${batang.variable} ${sans.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
