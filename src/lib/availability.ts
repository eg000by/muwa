// Единый шов «наличия» для витрины. Берёт стоп-лист из YTimes (боевой клиент
// или заглушка — см. ytimes/client.ts) и переводит GUID позиций YTimes в наши
// product.id через поле Product.ytimesGuid. Витрина знает только про id.
//
// Позиции без ytimesGuid стоп-листом не управляются и считаются доступными.
// Для частичного стопа (typeList не пуст — в стопе лишь часть порций) позицию
// целиком со витрины НЕ убираем: гость всё равно сможет выбрать доступную порцию.

import { ALL_PRODUCTS, type BranchKey } from "@/lib/menu";
import { getYtimesClient, isMockMode } from "@/lib/ytimes/client";
import { SHOP_GUID } from "@/lib/ytimes/config";

// Обратная карта GUID YTimes → наш product.id (по всем позициям меню).
const ID_BY_GUID: Record<string, string> = Object.values(ALL_PRODUCTS).reduce((m, p) => {
  if (p.ytimesGuid) m[p.ytimesGuid] = p.id;
  return m;
}, {} as Record<string, string>);

// Небольшой кэш по shopGuid: щадит лимит YTimes (30 запросов/час на точку) и
// ускоряет опрос витрины. Позже инвалидируется вебхуком изменения стоп-листа.
const CACHE_TTL_MS = 20_000;
const cache = new Map<string, { at: number; ids: Set<string> }>();

/** Раскупленные (в полном стопе) позиции филиала — набор наших product.id. */
export async function getSoldOutIds(branch: BranchKey): Promise<Set<string>> {
  const shopGuid = SHOP_GUID[branch];
  const now = Date.now();
  // Кэш нужен только чтобы щадить лимит реального YTimes (30 запросов/час на точку).
  // У заглушки лимита нет (локальный файл) — читаем всегда свежее, чтобы правки
  // стоп-листа сразу отражались и в SSR, а не только через клиентский опрос.
  const useCache = !isMockMode();
  const hit = useCache ? cache.get(shopGuid) : undefined;
  if (hit && now - hit.at < CACHE_TTL_MS) return hit.ids;

  const ids = new Set<string>();
  try {
    const stop = await getYtimesClient().getStopList(shopGuid);
    for (const it of stop) {
      // Частичный стоп (есть typeList) — позицию не скрываем целиком.
      if (it.typeList && it.typeList.length > 0) continue;
      const id = ID_BY_GUID[it.guid];
      if (id) ids.add(id);
    }
    if (useCache) cache.set(shopGuid, { at: now, ids });
  } catch (e) {
    console.error("[MUWA availability] YTimes стоп-лист недоступен:", e);
    // Фейл-опен: при ошибке считаем всё доступным (лучше показать, чем скрыть).
    if (hit) return hit.ids;
    return ids;
  }
  return ids;
}

/** Карта раскупленного по обоим филиалам — для витрины и опроса /api/availability. */
export async function getSoldOutMap(): Promise<Record<BranchKey, string[]>> {
  const branches = Object.keys(SHOP_GUID) as BranchKey[];
  const entries = await Promise.all(
    branches.map(async (b): Promise<[BranchKey, string[]]> => [b, [...(await getSoldOutIds(b))]])
  );
  return entries.reduce((m, [b, ids]) => { m[b] = ids; return m; }, {} as Record<BranchKey, string[]>);
}

/** Сброс кэша (например, после вебхука YTimes или dev-правки стоп-листа). */
export function invalidateAvailability(shopGuid?: string): void {
  if (shopGuid) cache.delete(shopGuid);
  else cache.clear();
}
