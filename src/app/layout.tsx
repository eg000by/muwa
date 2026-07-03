import type { Metadata } from "next";
import { Nunito, Oswald, Golos_Text } from "next/font/google";
import "./globals.css";

// Шрифты (с поддержкой кириллицы), self-hosted через next/font.
// Display — Nunito: округлый heavy-гротеск с кириллицей.
const baloo = Nunito({ variable: "--f-baloo", subsets: ["latin", "cyrillic"], weight: ["600", "700", "800"], display: "swap" });
const oswald = Oswald({ variable: "--f-oswald", subsets: ["latin", "cyrillic"], weight: ["300", "400", "500", "600"], display: "swap" });
const golos = Golos_Text({ variable: "--f-golos", subsets: ["latin", "cyrillic"], weight: ["400", "500", "600", "700"], display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Muwa — кофейня-кондитерская в Самаре | Keep muwa and save peace",
  description:
    "Muwa — душевная кофейня-кондитерская в Самаре: спешелти-кофе, домашние десерты и сытная кухня. Предзаказ с собой, подарочные сертификаты. Чапаевская, 92 и Некрасовская, 2.",
  keywords: ["кофейня Самара", "кондитерская Самара", "спешелти кофе Самара", "Muwa", "Чапаевская 92", "Некрасовская 2", "десерты Самара", "кофе с собой"],
  openGraph: {
    title: "Muwa — кофейня-кондитерская в Самаре",
    description: "Спешелти-кофе, домашние десерты и сытная кухня. Предзаказ с собой и подарочные сертификаты.",
    url: SITE_URL,
    siteName: "Muwa",
    locale: "ru_RU",
    type: "website",
    images: [{ url: "/assets/muwa-logo.webp", width: 150, height: 150, alt: "Muwa" }],
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${baloo.variable} ${oswald.variable} ${golos.variable}`}>
      <body>{children}</body>
    </html>
  );
}
