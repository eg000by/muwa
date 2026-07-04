import type { Metadata, Viewport } from "next";
import { Nunito, Oswald, Golos_Text } from "next/font/google";
import "./globals.css";

// Шрифты (с поддержкой кириллицы), self-hosted через next/font.
// Display — Nunito: округлый heavy-гротеск с кириллицей.
const baloo = Nunito({ variable: "--f-baloo", subsets: ["latin", "cyrillic"], weight: ["600", "700", "800"], display: "swap" });
const oswald = Oswald({ variable: "--f-oswald", subsets: ["latin", "cyrillic"], weight: ["300", "400", "500", "600"], display: "swap" });
const golos = Golos_Text({ variable: "--f-golos", subsets: ["latin", "cyrillic"], weight: ["400", "500", "600", "700"], display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// viewport-fit=cover — чтобы env(safe-area-inset-*) были доступны:
// шапка подкладывает фон под статус-бар, кнопки ящика не прячутся за home-индикатор.
export const viewport: Viewport = { viewportFit: "cover" };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // iOS Safari сам оборачивает длинные числа (ИНН/ОГРНИП) в tel-ссылки,
  // ломая гидрацию React. Отключаем авто-распознавание.
  formatDetection: { telephone: false, email: false, address: false },
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
    images: [{ url: "/assets/muwa-logo2.jpg", width: 150, height: 150, alt: "Muwa" }],
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${baloo.variable} ${oswald.variable} ${golos.variable}`}>
      <body>
        {children}
        {/* Safari восстанавливает скролл только после load (когда догрузятся фото):
            видно верх страницы, затем прыжок. Восстанавливаем позицию сами — скрипт
            в конце body выполняется до первой отрисовки, когда вся SSR-разметка уже
            распарсена, а высота карточек фиксирована в CSS и от фото не зависит.
            Сохраняем не только на pagehide: при выгрузке фоновой вкладки iOS его
            не гарантирует, надёжный сигнал — visibilitychange→hidden. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
if("scrollRestoration" in history)history.scrollRestoration="manual";
var save=function(){try{sessionStorage.setItem("muwa-y",String(scrollY))}catch(e){}};
addEventListener("pagehide",save);
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")save()});
if(location.hash)return;
var y=+(sessionStorage.getItem("muwa-y")||0);
if(y>0){var d=document.documentElement.style;d.scrollBehavior="auto";scrollTo(0,y);d.scrollBehavior=""}
}catch(e){}})();`,
          }}
        />
      </body>
    </html>
  );
}
