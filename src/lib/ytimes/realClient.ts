// Боевой клиент YTimes. Активируется, когда задан YTIMES_API_KEY (см. client.ts).
// Пока ключа нет — код не исполняется, но пишется сразу, чтобы переход на живой
// API был сменой env, а не переписыванием. Чтение стоп-листа безопасно (GET).

import type { StopListItem, YtimesClient } from "./types";
import { YTIMES_BASE_URL } from "./config";

// GET /ex/menu/stop/list/item?shopGuid=... — лимит 30 запросов/час на точку,
// поэтому наверху (availability.ts) стоит кэш, а опрос витрины редкий.
export function createRealClient(apiKey: string): YtimesClient {
  return {
    async getStopList(shopGuid) {
      const url = `${YTIMES_BASE_URL}/ex/menu/stop/list/item?shopGuid=${encodeURIComponent(shopGuid)}`;
      const res = await fetch(url, {
        headers: { Authorization: apiKey },
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`YTimes stop-list ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      const list: unknown[] = Array.isArray(data) ? data : data?.list ?? [];
      return list.map((raw): StopListItem => {
        const it = raw as Record<string, unknown>;
        return {
          guid: String(it.guid ?? ""),
          name: typeof it.name === "string" ? it.name : undefined,
          typeList: Array.isArray(it.typeList) ? (it.typeList as string[]) : null,
          reasonMessage: typeof it.reasonMessage === "string" ? it.reasonMessage : undefined,
          fromDate: typeof it.fromDate === "string" ? it.fromDate : undefined,
        };
      }).filter((it) => it.guid);
    },
  };
}
