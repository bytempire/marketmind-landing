"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";

import { formatMoney, formatNumber, moneyTone } from "@/components/commerce-ui";
import {
  atNoon,
  toIsoDate,
  type DateRange,
} from "@/components/range-calendar";
import type { Dashboard } from "@/lib/types";
import { cn } from "@/lib/utils";

export function fillRange(
  series: Dashboard["sales_series"],
  from: Date,
  to: Date,
): { date: string; revenue: number; units: number; delivered: number }[] {
  const map = new Map(
    series.map((p) => [
      p.date.slice(0, 10),
      {
        revenue: Number(p.revenue),
        units: p.ordered_units,
        delivered: p.delivered_units ?? 0,
      },
    ]),
  );
  const out: {
    date: string;
    revenue: number;
    units: number;
    delivered: number;
  }[] = [];
  const cur = atNoon(from);
  const end = atNoon(to);
  while (cur <= end) {
    const key = toIsoDate(cur);
    const hit = map.get(key);
    out.push({
      date: key,
      revenue: hit?.revenue ?? 0,
      units: hit?.units ?? 0,
      delivered: hit?.delivered ?? 0,
    });
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export function DeltaBadge({ value }: { value: number | null }) {
  if (value == null) return null;
  const up = value >= 0;
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        up
          ? "bg-emerald-500/15 text-emerald-500"
          : "bg-[var(--destructive)]/15 text-[var(--destructive)]",
      )}
    >
      {up ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

function pctDelta(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

function KpiStat({
  label,
  value,
  hint,
  delta,
  tone,
  detail,
}: {
  label: string;
  value: string;
  hint: string;
  delta?: number | null;
  tone?: string;
  detail?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <p className="text-sm text-[var(--muted-foreground)]" title={hint}>
        {label}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <p className={cn("text-2xl font-semibold tracking-tight", tone)}>
          {value}
        </p>
        {delta != null ? <DeltaBadge value={delta} /> : null}
      </div>
      {detail ? (
        <div className="mt-1 text-xs text-[var(--muted-foreground)]">{detail}</div>
      ) : null}
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  href,
  hrefLabel,
  delta,
  tone,
  detail,
  aside,
}: {
  label: string;
  value: string;
  hint: string;
  href: string;
  hrefLabel: string;
  delta?: number | null;
  tone?: string;
  detail?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      {aside ? (
        <div className="flex min-h-0 flex-1 gap-4">
          <KpiStat
            label={label}
            value={value}
            hint={hint}
            delta={delta}
            tone={tone}
          />
          <div className="w-px shrink-0 self-stretch bg-[var(--border)]" />
          {aside}
        </div>
      ) : (
        <div className="min-h-0 flex-1">
          <KpiStat
            label={label}
            value={value}
            hint={hint}
            delta={delta}
            tone={tone}
            detail={detail}
          />
        </div>
      )}
      <Link
        href={href}
        className="mt-auto inline-block pt-2 text-xs text-[var(--muted-foreground)] underline-offset-2 hover:underline"
      >
        {hrefLabel}
      </Link>
    </div>
  );
}

export function DashboardKpis({
  data,
  range,
}: {
  data: Dashboard;
  range: DateRange;
}) {
  const daily = useMemo(
    () => fillRange(data.sales_series, range.from, range.to),
    [data.sales_series, range.from, range.to],
  );
  const prevDaily = useMemo(() => {
    const length = daily.length;
    if (length === 0) return [];
    const prevTo = atNoon(range.from);
    prevTo.setDate(prevTo.getDate() - 1);
    const prevFrom = atNoon(prevTo);
    prevFrom.setDate(prevFrom.getDate() - (length - 1));
    return fillRange(data.sales_series, prevFrom, prevTo);
  }, [data.sales_series, daily.length, range.from]);

  const units = daily.reduce((s, p) => s + p.units, 0);
  const prevUnits = prevDaily.reduce((s, p) => s + p.units, 0);
  const delivered = daily.reduce((s, p) => s + p.delivered, 0);
  const prevDelivered = prevDaily.reduce((s, p) => s + p.delivered, 0);
  const buyoutRate = units > 0 ? (delivered / units) * 100 : null;
  const revenue = daily.reduce((s, p) => s + p.revenue, 0);
  const revenue90 = Number(data.commerce.revenue_90d);
  const margin90 = Number(data.commerce.approx_margin);
  const margin =
    revenue90 > 0 ? (margin90 / revenue90) * revenue : margin90;
  const oos = data.commerce.oos_count;
  const oosFbo = data.commerce.oos_fbo_count ?? 0;
  const oosFbs = data.commerce.oos_fbs_count ?? 0;
  const oosItems = data.commerce.oos_items ?? [];

  return (
    <div className="contents">
      <KpiCard
        label="Заказы"
        value={`${formatNumber(units)} шт`}
        hint="Заказанные единицы за выбранный период"
        href="/commerce/sales"
        hrefLabel="Продажи"
        delta={pctDelta(units, prevUnits)}
        aside={
          <KpiStat
            label="Выкупы"
            value={`${formatNumber(delivered)} шт`}
            hint="Доставленные покупателю единицы за выбранный период"
            delta={pctDelta(delivered, prevDelivered)}
            detail={
              buyoutRate != null
                ? `${buyoutRate.toFixed(0)}% от заказов`
                : undefined
            }
          />
        }
      />
      <KpiCard
        label="Маржа"
        value={formatMoney(margin)}
        hint="Оценка: доля маржи за 90 дней, умноженная на выручку периода"
        href="/commerce/economics"
        hrefLabel="Экономика"
        tone={moneyTone(margin)}
      />
      <KpiCard
        label="OOS"
        value={formatNumber(oos)}
        hint="Только SKU с продажами, которым не хватит запаса на 14 дней. Новые карточки без продаж не входят"
        href="/commerce/stocks"
        hrefLabel="Остатки"
        tone={oos > 0 ? "text-amber-500" : undefined}
        detail={
          <>
            <span className={oosFbo > 0 ? "text-amber-500" : undefined}>
              FBO {formatNumber(oosFbo)}
            </span>
            {" · "}
            <span className={oosFbs > 0 ? "text-amber-500" : undefined}>
              FBS {formatNumber(oosFbs)}
            </span>
            {oosItems.length > 0 ? (
              <ul className="mt-1 space-y-0.5">
                {oosItems.slice(0, 3).map((item) => {
                  const name = item.title?.trim() || item.sku;
                  const channels = [
                    (item.available_fbo ?? item.fbo ?? 0) <= 0 ? "FBO" : null,
                    (item.available_fbs ?? item.fbs ?? 0) <= 0 ? "FBS" : null,
                  ].filter(Boolean);
                  const days =
                    item.idc != null && Number(item.idc) >= 0
                      ? ` · ${Math.round(Number(item.idc))} дн.`
                      : "";
                  return (
                    <li
                      key={item.sku}
                      className="truncate text-amber-500"
                      title={`${name} · ${item.sku}`}
                    >
                      {name}
                      {channels.length > 0 ? ` · ${channels.join("/")}` : ""}
                      {days}
                    </li>
                  );
                })}
                {oosItems.length > 3 ? (
                  <li className="text-[var(--muted-foreground)]">
                    ещё {oosItems.length - 3} →{" "}
                    <Link
                      href="/commerce/stocks"
                      className="underline-offset-2 hover:underline"
                    >
                      остатки
                    </Link>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </>
        }
      />
    </div>
  );
}
