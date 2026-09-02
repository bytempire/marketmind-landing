/** Интервалы auto-refresh с запасом под лимиты Ozon Seller / Performance. */

/** Live GET к Ozon (заявки, автоакции): не чаще 1 req/min. */
export const OZON_LIVE_REFRESH_MS = 60_000;

/** Fallback, если API не вернул retry_after_seconds (15 мин). */
export const OZON_SYNC_FALLBACK_INTERVAL_SEC = 900;

/** Опрос локальных данных, пока фоновый sync пишет в БД. */
export const LOCAL_DATA_POLL_MS = 15_000;
