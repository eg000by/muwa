// Типы внешнего API YTimes (пока используется только стоп-лист).
// Форма StopListItem повторяет ответ GET /ex/menu/stop/list/item.

export interface StopListItem {
  /** GUID позиции в номенклатуре YTimes. */
  guid: string;
  /** Название позиции (для логов/диагностики). */
  name?: string;
  /** Список порций в стопе. Пусто/undefined = вся позиция целиком. */
  typeList?: string[] | null;
  /** Причина, указанная баристой при постановке в стоп. */
  reasonMessage?: string;
  /** Когда позиция попала в стоп. */
  fromDate?: string;
}

/** Абстракция над YTimes. Реализуется заглушкой (mock) и боевым клиентом (real).
 *  Позже сюда добавятся getMenu / saveOrder — витрине это знать не нужно. */
export interface YtimesClient {
  getStopList(shopGuid: string): Promise<StopListItem[]>;
}
