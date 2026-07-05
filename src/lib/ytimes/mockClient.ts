// Заглушка YTimes на время, пока нет боевого ключа API.
// Стоп-лист хранится в data/mock-stoplist.json вида { [shopGuid]: guid[] }.
// Файла нет → стоп-лист пуст (всё в наличии). Менять можно вручную или через
// dev-эндпоинт POST /api/dev/stoplist. Форма ответа совпадает с реальным API,
// поэтому вся цепочка (availability → витрина) тестируется как на живых данных.

import { promises as fs } from "node:fs";
import path from "node:path";
import type { StopListItem, YtimesClient } from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "mock-stoplist.json");

type Store = Record<string, string[]>;

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Store) : {};
  } catch {
    // Нет файла/битый JSON — считаем стоп-лист пустым.
    return {};
  }
}

async function writeStore(store: Store): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

export const mockClient: YtimesClient = {
  async getStopList(shopGuid) {
    const store = await readStore();
    const guids = store[shopGuid] || [];
    return guids.map<StopListItem>((guid) => ({ guid }));
  },
};

/** Тестовая правка мок-стоп-листа (для dev-эндпоинта). `on=true` — поставить в
 *  стоп, `false` — вернуть в наличие. Возвращает актуальный список guid точки. */
export async function setMockStop(shopGuid: string, guid: string, on: boolean): Promise<string[]> {
  const store = await readStore();
  const set = new Set(store[shopGuid] || []);
  if (on) set.add(guid);
  else set.delete(guid);
  store[shopGuid] = [...set];
  await writeStore(store);
  return store[shopGuid];
}
