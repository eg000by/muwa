import MuwaSite from "@/components/MuwaSite";
import { PRODUCTS } from "@/lib/menu";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Структурированные данные Schema.org для локального SEO (Яндекс/Google).
function jsonLd() {
  const branches = [
    { name: "Muwa — Чапаевская", street: "ул. Чапаевская, 92" },
    { name: "Muwa — Некрасовская", street: "ул. Некрасовская, 2" },
  ];
  const hasMenu = Object.values(PRODUCTS).flat().slice(0, 12).map((p) => ({
    "@type": "MenuItem",
    name: p.name,
    description: p.desc,
    offers: { "@type": "Offer", price: p.price, priceCurrency: "RUB" },
  }));

  return branches.map((b) => ({
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: b.name,
    description: "Спешелти-кофе, домашние десерты и сытная кухня в Самаре.",
    servesCuisine: ["Кофе", "Десерты", "Завтраки"],
    priceRange: "₽₽",
    address: {
      "@type": "PostalAddress",
      streetAddress: b.street,
      addressLocality: "Самара",
      addressCountry: "RU",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "09:00",
      closes: "21:00",
    },
    url: SITE_URL,
    hasMenu: { "@type": "Menu", hasMenuItem: hasMenu },
  }));
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
      />
      <MuwaSite />
    </>
  );
}
