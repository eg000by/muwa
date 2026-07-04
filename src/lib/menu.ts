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
  /** В каких филиалах есть позиция. Нет поля — есть во всех. */
  branches?: BranchKey[];
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
    { id: "malina", name: "Малиновый тарт", desc: "Песочная основа и свежая малина", price: 360, kbzhu: "≈360 ккал · Б6 Ж19 У40", img: "muwa-malina-tart.jpg", branches: ["chap"] },
    { id: "moti", name: "Моти", desc: "Рисовое тесто с нежной начинкой", price: 220, kbzhu: "≈180 ккал · Б3 Ж6 У29", img: "muwa-moti.jpg", branches: ["nekr"] },
    { id: "shokolad", name: "Шоколадный ломтик", desc: "Плотный шоколадный бисквит", price: 300, kbzhu: "≈380 ккал · Б7 Ж22 У36", img: "muwa-shokolad.jpg" },
    { id: "bulochka", name: "Булочка с маком", desc: "Сдобная булочка с маковой начинкой", price: 180, kbzhu: "≈290 ккал · Б6 Ж10 У42", img: "muwa-bulochka-mak.jpg" },
  ],
  kitchen: [
    { id: "kish", name: "Киш с беконом", desc: "Открытый пирог с беконом и заливкой", price: 340, kbzhu: "≈420 ккал · Б15 Ж27 У28", img: "muwa-kish-bekon.jpg", tag: "хит" },
    { id: "galeta", name: "Галета с баклажаном", desc: "Хрустящее тесто, баклажан и томаты", price: 320, kbzhu: "≈380 ккал · Б10 Ж21 У36", img: "muwa-galeta-baklazhan.jpg", branches: ["nekr"] },
    { id: "sandrost", name: "Сэндвич с ростбифом", desc: "Зерновой хлеб, сочный ростбиф, корнишоны и перец", price: 390, kbzhu: "≈480 ккал · Б26 Ж22 У40", img: "muwa-sandwich-rostbeef.jpg", tag: "новинка" },
    { id: "sandchick", name: "Сэндвич с курицей", desc: "Гриль-тост с курицей, чеддером и томатом", price: 340, kbzhu: "≈440 ккал · Б24 Ж21 У38", img: "muwa-sandwich-chicken.jpg" },
    { id: "pita", name: "Сытная пита", desc: "Тёплая пита с мясной начинкой и овощами", price: 350, kbzhu: "≈470 ккал · Б18 Ж20 У50", img: "muwa-pita2.jpg", branches: ["nekr"] },
    { id: "humus", name: "Хумус с грибами", desc: "Нежный хумус, жареные грибы и тыквенные семечки, с питой", price: 330, kbzhu: "≈390 ккал · Б14 Ж22 У34", img: "muwa-humus.jpg", branches: ["chap"] },
  ],
  drinks: [
    { id: "grib", name: "Грибной латте", desc: "На чаге, мягкий и согревающий", price: 260, kbzhu: "на молоке по вкусу", img: "muwa-grib.jpg" },
    { id: "filter", name: "Фильтр", desc: "Кофе недели, заварка V60", price: 250, kbzhu: "без сахара", img: "muwa-filtr.jpg", tag: "кофе недели" },
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
