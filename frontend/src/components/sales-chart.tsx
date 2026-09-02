"use client";

import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { QueryState } from "@/components/query-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCommerceSales } from "@/lib/hooks";
import type { SalesPoint, TopSku } from "@/lib/types";
import { cn } from "@/lib/utils";

const PERIODS = [
  { days: 7, label: "7 дней" },
  { days: 14, label: "14 дней" },
  { days: 30, label: "30 дней" },
] as const;

type PeriodDays = (typeof PERIODS)[number]["days"];

function formatMoney(value: string | number | null | undefined): string {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function periodRange(days: number, end: Date = new Date()) {
  const dateTo = new Date(end);
  dateTo.setHours(12, 0, 0, 0);
  const dateFrom = new Date(dateTo);
  dateFrom.setDate(dateFrom.getDate() - (days - 1));
  return { dateFrom: toIsoDate(dateFrom), dateTo: toIsoDate(dateTo) };
}

function previousRange(days: number, currentFrom: string) {
  const end = new Date(`${currentFrom}T12:00:00`);
  end.setDate(end.getDate() - 1);
  return periodRange(days, end);
}

function fillSeries(
  series: SalesPoint[],
  dateFrom: string,
  dateTo: string,
): { date: string; revenue: number; units: number }[] {
  const map = new Map(
    series.map((p) => [
      p.date.slice(0, 10),
      { revenue: Number(p.revenue), units: p.ordered_units },
    ]),
  );
  const out: { date: string; revenue: number; units: number }[] = [];
  const cur = new Date(`${dateFrom}T12:00:00`);
  const end = new Date(`${dateTo}T12:00:00`);
  while (cur <= end) {
    const key = toIsoDate(cur);
    const hit = map.get(key);
    out.push({
      date: key,
      revenue: hit?.revenue ?? 0,
      units: hit?.units ?? 0,
    });
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function sumRevenue(points: { revenue: number }[]): number {
  return points.reduce((acc, p) => acc + p.revenue, 0);
}

type ChartRow = {
  label: string;
  date: string;
  prevDate?: string;
  current: number;
  previous?: number;
  units: number;
  prevUnits?: number;
};

function SalesTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartRow }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm shadow-sm">
      <div className="mb-1 font-medium">
        {new Date(`${row.date}T12:00:00`).toLocaleDateString("ru-RU")}
      </div>
      <div>
        Текущий: {formatMoney(row.current)} · {row.units} шт.
      </div>
      {row.prevDate != null && row.previous != null ? (
        <div className="text-[var(--muted-foreground)]">
          Прошлый ({formatShortDate(row.prevDate)}): {formatMoney(row.previous)}{" "}
          · {row.prevUnits ?? 0} шт.
        </div>
      ) : null}
    </div>
  );
}

export function SalesChartSection() {
  const [days, setDays] = useState<PeriodDays>(14);
  const [compare, setCompare] = useState(true);

  const current = useMemo(() => periodRange(days), [days]);
  const previous = useMemo(
    () => previousRange(days, current.dateFrom),
    [days, current.dateFrom],
  );

  const sales = useCommerceSales(current.dateFrom, current.dateTo);
  const prevSales = useCommerceSales(
    previous.dateFrom,
    previous.dateTo,
    compare,
  );

  const chartData = useMemo(() => {
    if (!sales.data) return [];
    const cur = fillSeries(
      sales.data.series,
      current.dateFrom,
      current.dateTo,
    );
    const prev = compare
      ? fillSeries(
          prevSales.data?.series ?? [],
          previous.dateFrom,
          previous.dateTo,
        )
      : [];
    return cur.map((point, idx): ChartRow => {
      const prevPoint = prev[idx];
      return {
        label: formatShortDate(point.date),
        date: point.date,
        prevDate: prevPoint?.date,
        current: point.revenue,
        previous: prevPoint?.revenue,
        units: point.units,
        prevUnits: prevPoint?.units,
      };
    });
  }, [sales.data, prevSales.data, current, previous, compare]);

  const curTotal = sumRevenue(chartData.map((r) => ({ revenue: r.current })));
  const prevTotal = compare
    ? sumRevenue(chartData.map((r) => ({ revenue: r.previous ?? 0 })))
    : 0;
  const deltaPct =
    compare && prevTotal > 0
      ? ((curTotal - prevTotal) / prevTotal) * 100
      : null;

  const loading = sales.isLoading || (compare && prevSales.isLoading);
  const error = sales.isError || (compare && prevSales.isError);
  const empty = !loading && !error && chartData.every((r) => r.current === 0);
  const topSkus: TopSku[] = sales.data?.top_skus ?? [];

  return (
    <section className="mb-8">
      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Продажи</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {PERIODS.map((p) => (
              <Button
                key={p.days}
                type="button"
                size="sm"
                variant={days === p.days ? "default" : "outline"}
                onClick={() => setDays(p.days)}
              >
                {p.label}
              </Button>
            ))}
            <Button
              type="button"
              size="sm"
              variant={compare ? "default" : "outline"}
              onClick={() => setCompare((v) => !v)}
            >
              Сравнить с прошлым
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <QueryState
            isLoading={loading}
            isError={error}
            isEmpty={empty}
            emptyText="Нет данных о продажах. Синхронизация с Ozon идёт автоматически."
          >
            <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
              <span>
                Выручка:{" "}
                <span className="font-semibold">{formatMoney(curTotal)}</span>
              </span>
              {compare ? (
                <>
                  <span className="text-[var(--muted-foreground)]">
                    Прошлый период: {formatMoney(prevTotal)}
                  </span>
                  {deltaPct != null ? (
                    <span
                      className={cn(
                        "font-medium",
                        deltaPct >= 0
                          ? "text-emerald-600"
                          : "text-[var(--destructive)]",
                      )}
                    >
                      {deltaPct >= 0 ? "+" : ""}
                      {deltaPct.toFixed(0)}% к прошлому
                    </span>
                  ) : null}
                </>
              ) : null}
            </div>

            <div className="mb-6 h-64 w-full sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="salesCurrentFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--primary)"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--primary)"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="var(--border)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border)" }}
                    interval="preserveStartEnd"
                    minTickGap={28}
                  />
                  <YAxis
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `${Math.round(v / 1000)}к` : String(v)
                    }
                  />
                  <Tooltip content={<SalesTooltip />} />
                  {compare ? (
                    <Legend
                      wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                      formatter={(value) => (
                        <span className="text-[var(--muted-foreground)]">
                          {value}
                        </span>
                      )}
                    />
                  ) : null}
                  <Area
                    type="monotone"
                    dataKey="current"
                    name="Текущий период"
                    stroke="var(--primary)"
                    fill="url(#salesCurrentFill)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  {compare ? (
                    <Line
                      type="monotone"
                      dataKey="previous"
                      name="Прошлый период"
                      stroke="var(--muted-foreground)"
                      strokeWidth={2}
                      strokeDasharray="5 4"
                      dot={false}
                      connectNulls
                    />
                  ) : null}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <h3 className="mb-2 text-sm font-medium">Топ товаров по выручке</h3>
            {topSkus.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Нет данных</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {topSkus.slice(0, 10).map((s) => (
                  <li
                    key={s.sku}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate pr-2">{s.title ?? s.sku}</span>
                    <span className="shrink-0 font-medium">
                      {formatMoney(s.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </CardContent>
      </Card>
    </section>
  );
}
