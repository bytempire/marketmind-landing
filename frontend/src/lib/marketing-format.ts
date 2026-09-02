/** Хелперы периода и форматирования для раздела Маркетинг. */

export const MARKETING_PERIODS = [
  { days: 7, label: "7 дней" },
  { days: 14, label: "14 дней" },
  { days: 30, label: "30 дней" },
  { days: 60, label: "60 дней" },
] as const;

export type MarketingPeriodDays = (typeof MARKETING_PERIODS)[number]["days"];
export type MarketingPeriodMode = MarketingPeriodDays | "custom";

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function periodRange(days: number, end: Date = new Date()) {
  const dateTo = new Date(end);
  dateTo.setHours(12, 0, 0, 0);
  const dateFrom = new Date(dateTo);
  dateFrom.setDate(dateFrom.getDate() - (days - 1));
  return { dateFrom: toIsoDate(dateFrom), dateTo: toIsoDate(dateTo) };
}

export function formatMoney(value: string | number | null | undefined): string {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatPct(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  return `${formatNumber(value)}%`;
}

export function formatPeriod(from: string, to: string): string {
  const a = new Date(`${from}T12:00:00`).toLocaleDateString("ru-RU");
  const b = new Date(`${to}T12:00:00`).toLocaleDateString("ru-RU");
  return `${a} — ${b}`;
}

export function drrTone(
  value: string | number | null | undefined,
): "success" | "warning" | "destructive" | "secondary" {
  if (value == null || value === "") return "secondary";
  const n = Number(value);
  if (Number.isNaN(n)) return "secondary";
  if (n <= 10) return "success";
  if (n <= 20) return "warning";
  return "destructive";
}

export function drrHint(value: string | number | null | undefined): string {
  if (value == null || value === "") {
    return "Нет расхода или выручки — ДРР не считается";
  }
  const n = Number(value);
  if (Number.isNaN(n)) return "Доля рекламных расходов";
  if (n <= 10) return "Хорошо: реклама окупается";
  if (n <= 20) return "Нормально, смотрите слабые SKU";
  return "Высокий: расход съедает выручку";
}

export function stateLabel(state: string | null | undefined): string {
  const map: Record<string, string> = {
    CAMPAIGN_STATE_RUNNING: "Вкл. в API",
    CAMPAIGN_STATE_INACTIVE: "Выключена",
    CAMPAIGN_STATE_STOPPED: "Без бюджета",
    CAMPAIGN_STATE_ARCHIVED: "Архив",
    CAMPAIGN_STATE_FINISHED: "Завершена",
    CAMPAIGN_STATE_PLANNED: "Запланирована",
  };
  return state ? (map[state] ?? state) : "—";
}

export function campaignTypeLabel(type: string | null | undefined): string {
  const map: Record<string, string> = {
    SKU: "Оплата за клик",
    BANNER: "Баннеры",
    SEARCH_PROMO: "Оплата за заказ",
  };
  return type ? (map[type] ?? type) : "Тип не указан";
}

export function paymentLabel(type: string | null | undefined): string | null {
  const map: Record<string, string> = {
    CPC: "за клик",
    CPM: "за показы",
    CPO: "за заказ",
  };
  if (!type) return null;
  return map[type] ?? type;
}

export function formatRemaining(
  seconds: number | null | undefined,
  fallback: string | null | undefined,
): string {
  if (seconds != null && seconds > 0) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${h}:${pad(m)}:${pad(s)}`;
  }
  return formatDateTime(fallback);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function actionTypeLabel(type: string | null | undefined): string {
  const map: Record<string, string> = {
    ELASTIC_BOOSTING: "Эластичный бустинг",
    DISCOUNT: "Скидка",
    STOCK_DISCOUNT: "Скидка на остаток",
    FLASH_SALE: "Flash Sale",
    VOUCHER: "Промокод",
  };
  if (!type) return "Акция";
  return map[type] ?? type;
}
