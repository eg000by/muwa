// Данные витрины и филиалов Muwa.
// На время демо — локальный типизированный модуль (без БД/Payload).
// После одобрения проекта переедет в Payload CMS.

export type TabKey = "desserts" | "kitchen" | "drinks";

export interface Product {
  id: string;
  name: string;
  desc: string;
  price: number;
  kbzhu: string;
  /** Имя файла в /public/assets. Если нет — карточка покажет плейсхолдер «фото скоро». */
  img?: string;
  tag?: string;
}

export interface BranchInfo {
  id: BranchKey;
  addr: string;
  near: string;
  hero: string; // hero-изображение филиала
}

export type BranchKey = "chap" | "nekr";

export const PRODUCTS: Record<TabKey, Product[]> = {
  desserts: [
    { id: "cheese", name: "Чизкейк", desc: "Нежный ванильный крем и свежая голубика", price: 340, kbzhu: "≈340 ккал · Б7 Ж24 У22", img: "muwa-cheesecake.jpg", tag: "хит" },
    { id: "malina", name: "Малиновый тарт", desc: "Песочная основа и свежая малина", price: 360, kbzhu: "≈360 ккал · Б6 Ж19 У40", img: "muwa-malina-tart.jpg" },
    { id: "moti", name: "Моти", desc: "Рисовое тесто с нежной начинкой", price: 220, kbzhu: "≈180 ккал · Б3 Ж6 У29", img: "muwa-moti.jpg" },
    { id: "shokolad", name: "Шоколадный ломтик", desc: "Плотный шоколадный бисквит", price: 300, kbzhu: "≈380 ккал · Б7 Ж22 У36", img: "muwa-shokolad.jpg" },
    { id: "bulochka", name: "Булочка с маком", desc: "Сдобная булочка с маковой начинкой", price: 180, kbzhu: "≈290 ккал · Б6 Ж10 У42", img: "muwa-bulochka-mak.jpg" },
    { id: "sanseb", name: "Фисташковый блинный торт", desc: "Тонкие блины и фисташковый крем", price: 390, kbzhu: "≈420 ккал · Б9 Ж26 У33" },
  ],
  kitchen: [
    { id: "kish", name: "Киш с беконом", desc: "Открытый пирог с беконом и заливкой", price: 340, kbzhu: "≈420 ккал · Б15 Ж27 У28", img: "muwa-kish-bekon.jpg", tag: "хит" },
    { id: "galeta", name: "Галета с баклажаном", desc: "Хрустящее тесто, баклажан и томаты", price: 320, kbzhu: "≈380 ккал · Б10 Ж21 У36", img: "muwa-galeta-baklazhan.jpg" },
    { id: "falafel", name: "Фалафель в пите", desc: "Легендарный, с соусом тхина", price: 340, kbzhu: "≈460 ккал · Б14 Ж19 У48", tag: "легенда" },
  ],
  drinks: [
    { id: "grib", name: "Грибной латте", desc: "На чаге, мягкий и согревающий", price: 260, kbzhu: "на молоке по вкусу", img: "muwa-grib.jpg" },
    { id: "filter", name: "Фильтр", desc: "Кофе недели, заварка V60", price: 250, kbzhu: "без сахара", img: "muwa-filtr.jpg", tag: "кофе недели" },
    { id: "capp", name: "Капучино", desc: "Спешелти-эспрессо и молоко", price: 220, kbzhu: "на молоке по вкусу" },
    { id: "ginger", name: "Имбирный американо", desc: "Эспрессо, имбирь, цитрус", price: 240, kbzhu: "бодрит" },
    { id: "matcha", name: "Матча латте", desc: "Церемониальная матча", price: 280, kbzhu: "на молоке по вкусу" },
    { id: "tea", name: "Авторский чай", desc: "Сезонный купаж, чайник 500 мл", price: 260, kbzhu: "на компанию" },
  ],
};

export const BRANCHES: Record<BranchKey, BranchInfo> = {
  chap: { id: "chap", addr: "Чапаевская, 92", near: "исторический центр, красный кирпич", hero: "muwa-chap-bar.jpg" },
  nekr: { id: "nekr", addr: "Некрасовская, 2", near: "возле галереи «Виктория»", hero: "muwa-nekrasovskaya.webp" },
};

export const TIMES = ["Через 15 минут", "Через 30 минут", "К 14:30", "К 18:00"];

export const GIFT_AMOUNTS = [500, 1000, 2000, 3000];

export const TAB_HINTS: Record<TabKey, string> = {
  desserts: "Свежие кондитерские изделия каждый день",
  kitchen: "Сытно и по-домашнему",
  drinks: "Спешелти-классика и авторское",
};

export const ALL_PRODUCTS: Record<string, Product> = Object.values(PRODUCTS)
  .flat()
  .reduce((m, p) => { m[p.id] = p; return m; }, {} as Record<string, Product>);

export const priceLabel = (n: number) => `${n} ₽`;
