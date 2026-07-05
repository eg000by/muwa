// Карта филиалов Muwa → идентификаторы точек (shopGuid) в YTimes.
// Реальные GUID берутся из GET /ex/shop/list и задаются через env; пока ключа
// нет — используем предсказуемые mock-значения, по которым работает заглушка.

import type { BranchKey } from "@/lib/menu";

export const SHOP_GUID: Record<BranchKey, string> = {
  chap: process.env.YTIMES_SHOP_CHAP || "mock-shop-chap",
  nekr: process.env.YTIMES_SHOP_NEKR || "mock-shop-nekr",
};

/** Базовый адрес внешнего API YTimes (переопределяется env при необходимости). */
export const YTIMES_BASE_URL = process.env.YTIMES_BASE_URL || "https://api.ytimes.ru";

/** Обратная карта shopGuid → филиал (для роутов, приходящих с shopGuid). */
export const BRANCH_BY_SHOP: Record<string, BranchKey> = Object.entries(SHOP_GUID)
  .reduce((m, [branch, guid]) => { m[guid] = branch as BranchKey; return m; }, {} as Record<string, BranchKey>);
