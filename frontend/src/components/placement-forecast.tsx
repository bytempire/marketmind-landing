"use client";

import { Table, TBody, TH, THead, TR, TD } from "@/components/ui/table";
import type { PlacementResponse, PlacementSkuItem } from "@/lib/types";

function formatRub(value: string | number | null | undefined): string {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return "—";
  if (n === 0) return "—";
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(n);
}

function formatDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

type Props = {
  data: PlacementResponse;
};

export function PlacementForecast({ data }: Props) {
  const rows: PlacementSkuItem[] = [...data.paid, ...data.soon].sort(
    (a, b) => Number(b.forecast_total) - Number(a.forecast_total),
  );
  if (rows.length === 0 || data.forecast_dates.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium">Прогноз на 30 дней, ₽</h3>
        <p className="text-sm tabular-nums">
          Итого:{" "}
          <span className="font-medium">{formatRub(data.forecast_total)} ₽</span>
        </p>
      </div>
      <p className="mb-3 text-xs text-[var(--muted-foreground)]">
        По уже платным — фактическая ставка за день. По «скоро» без своей ставки —
        оценка по средней ₽/шт среди платных (помечено ≈).
      </p>
      <Table>
        <THead>
          <TR>
            <TH className="sticky left-0 z-10 min-w-[10rem] bg-[var(--card)]">
              SKU
            </TH>
            <TH className="min-w-[4.5rem] text-right">Итого</TH>
            {data.forecast_dates.map((day) => (
              <TH key={day} className="min-w-[3.25rem] text-right tabular-nums">
                {formatDay(day)}
              </TH>
            ))}
          </TR>
        </THead>
        <TBody>
          {rows.map((item) => (
            <TR key={`fc-${item.sku}`}>
              <TD className="sticky left-0 z-10 max-w-[14rem] truncate bg-[var(--card)] font-medium">
                {item.title ?? item.sku}
                <span className="text-[var(--muted-foreground)]">
                  {" "}
                  · {item.sku}
                  {item.rate_estimated ? " ≈" : ""}
                </span>
              </TD>
              <TD className="text-right font-medium tabular-nums">
                {formatRub(item.forecast_total)}
              </TD>
              {item.forecast_daily.map((amount, idx) => (
                <TD
                  key={`${item.sku}-${data.forecast_dates[idx]}`}
                  className="text-right tabular-nums text-[var(--muted-foreground)]"
                >
                  {formatRub(amount)}
                </TD>
              ))}
            </TR>
          ))}
          <TR className="border-t border-[var(--border)] font-medium">
            <TD className="sticky left-0 z-10 bg-[var(--card)]">Всего</TD>
            <TD className="text-right tabular-nums">
              {formatRub(data.forecast_total)}
            </TD>
            {data.forecast_by_day.map((amount, idx) => (
              <TD
                key={`total-${data.forecast_dates[idx]}`}
                className="text-right tabular-nums"
              >
                {formatRub(amount)}
              </TD>
            ))}
          </TR>
        </TBody>
      </Table>
    </div>
  );
}
