// Фабрика клиента YTimes по паттерну «env-опционально + фолбэк»:
// задан YTIMES_API_KEY → боевой клиент; иначе → заглушка на data/mock-stoplist.json.
// Витрина и availability.ts зовут getYtimesClient() и не знают, что под капотом.

import type { YtimesClient } from "./types";
import { mockClient } from "./mockClient";
import { createRealClient } from "./realClient";

let cached: YtimesClient | null = null;

export function getYtimesClient(): YtimesClient {
  if (cached) return cached;
  const apiKey = process.env.YTIMES_API_KEY;
  cached = apiKey ? createRealClient(apiKey) : mockClient;
  return cached;
}

/** true, когда работаем на заглушке (нет боевого ключа). Используется dev-роутом. */
export const isMockMode = () => !process.env.YTIMES_API_KEY;
