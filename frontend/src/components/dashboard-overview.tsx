"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { CreateTaskButton } from "@/components/create-task-button";
import { formatMoney, formatNumber } from "@/components/commerce-ui";
import { DashboardKpis, DeltaBadge, fillRange } from "@/components/dashboard-kpis";
import {
  RangeCalendar,
  atNoon,
  rangeOfDays,
  toIsoDate,
  type DateRange,
} from "@/components/range-calendar";
import { Badge } from "@/components/ui/badge";
import { useCommerceBriefing } from "@/lib/hooks";
import { formatPct } from "@/lib/marketing-format";
import type { BriefingItem, Dashboard } from "@/lib/types";
import { taskPayloadFromInsight } from "@/lib/task-from-source";
import { cn } from "@/lib/utils";

const PRESETS = [
  { days: 7, label: "7д" },
  { days: 30, label: "30д" },
  { days: 90, label: "90д" },
] as const;

const COST_COLORS = ["#6366f1", "#38bdf8", "#f59e0b", "#34d399", "#a78bfa"];

const KIND_LABEL: Record<string, string> = {
  oos: "Остатки",
  expiration: "Срок",
  sales_drop: "Продажи",
  content: "Контент",
  price: "Цены",
};

function groupBars(daily: { date: string; revenue: number; units: number }[]) {
  if (daily.length <= 14) {
    return daily.map((p) => ({
      key: p.date,
      label: new Date(`${p.date}T12:00:00`).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
      }),
      revenue: p.revenue,
      units: p.units,
    }));
  }
  const weeks: {
    key: string;
    label: string;
    revenue: number;
    units: number;
  }[] = [];
  for (let i = 0; i < daily.length; i += 7) {
    const chunk = daily.slice(i, i + 7);
    const last = chunk.at(-1);
    if (!last) continue;
    weeks.push({
      key: last.date,
      label: new Date(`${last.date}T12:00:00`).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "short",
      }),
      revenue: chunk.reduce((s, p) => s + p.revenue, 0),
      units: chunk.reduce((s, p) => s + p.units, 0),
    });
  }
  return weeks;
}

function Panel({
  className,
  children,
  fillHeight = false,
}: {
  className?: string;
  children: React.ReactNode;
  fillHeight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5",
        fillHeight && "h-full",
        className,
      )}
    >
      {children}
    </div>
  );
}

function RevenueChart({
  data,
  range,
}: {
  data: Dashboard;
  range: DateRange;
}) {
  const [active, setActive] = useState<number | null>(null);
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
  const bars = useMemo(() => groupBars(daily), [daily]);
  const total = daily.reduce((s, p) => s + p.revenue, 0);
  const prevTotal = prevDaily.reduce((s, p) => s + p.revenue, 0);
  const delta =
    prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : null;
  const highlight = active ?? bars.length - 1;
  const highlighted = bars[highlight];

  return (
    <Panel fillHeight>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">Выручка</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-3xl font-semibold tracking-tight">
              {formatMoney(total)}
            </p>
            <DeltaBadge value={delta} />
          </div>
        </div>
      </div>
      <div className="relative mt-5 min-h-56 w-full flex-1">
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bars} barCategoryGap="28%">
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              content={({ active: tipOn, payload }) => {
                if (!tipOn || !payload?.length) return null;
                const row = payload[0]?.payload as (typeof bars)[number];
                return (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm shadow-sm">
                    <div className="font-medium">{formatMoney(row.revenue)}</div>
                    <div className="text-[var(--muted-foreground)]">
                      {row.label} · {formatNumber(row.units)} шт
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="revenue" radius={[8, 8, 4, 4]}>
              {bars.map((bar, idx) => (
                <Cell
                  key={bar.key}
                  cursor="pointer"
                  fill={
                    idx === highlight
                      ? "var(--primary)"
                      : "color-mix(in srgb, var(--foreground) 18%, transparent)"
                  }
                  onClick={() => setActive(idx)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
      {highlighted ? (
        <p className="mt-2 shrink-0 text-xs text-[var(--muted-foreground)]">
          {highlighted.label}: {formatMoney(highlighted.revenue)}
        </p>
      ) : null}
    </Panel>
  );
}

function CalendarPanel({
  range,
  minDate,
  maxDate,
  onChange,
}: {
  range: DateRange;
  minDate: Date;
  maxDate: Date;
  onChange: (next: DateRange) => void;
}) {
  return (
    <Panel fillHeight>
      <div className="mb-3 flex gap-1">
        {PRESETS.map((p) => {
          const selected =
            toIsoDate(range.from) ===
              toIsoDate(rangeOfDays(p.days, maxDate).from) &&
            toIsoDate(range.to) === toIsoDate(maxDate);
          return (
            <button
              key={p.days}
              type="button"
              onClick={() => onChange(rangeOfDays(p.days, maxDate))}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs",
                selected
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <RangeCalendar
        range={range}
        minDate={minDate}
        maxDate={maxDate}
        onChange={onChange}
      />
    </Panel>
  );
}

function HealthPanel({ data }: { data: Dashboard }) {
  const health = data.health_avg;
  return (
    <Panel fillHeight className="p-4">
      <div className="flex min-h-0 flex-1 flex-col">
        <p className="text-sm text-[var(--muted-foreground)]">Health Score</p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="text-3xl font-semibold">
            {health != null ? Math.round(health) : "—"}
          </p>
          <span className="text-xs text-[var(--muted-foreground)]">
            рейтинг {data.average_rating ?? "—"}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
          <div
            className="h-2 rounded-full bg-[var(--primary)]"
            style={{ width: `${Math.min(100, health ?? 0)}%` }}
          />
        </div>
      </div>
    </Panel>
  );
}

function CostsDonut({ data }: { data: Dashboard }) {
  const slices = [
    { name: "Комиссии", value: Number(data.commerce.commissions) },
    { name: "Логистика", value: Number(data.commerce.logistics) },
    { name: "Хранение", value: Number(data.commerce.storage) },
    { name: "Реклама", value: Number(data.commerce.marketing_cost) },
    { name: "Прочее", value: Number(data.commerce.other) },
  ].filter((s) => s.value > 0);
  const total = slices.reduce((s, x) => s + x.value, 0);

  return (
    <Panel fillHeight>
      <p className="text-sm font-medium">Расходы</p>
      {slices.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Нет списаний за период
        </p>
      ) : (
        <div className="mt-2 flex items-center gap-4">
          <div className="relative h-36 w-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  innerRadius={46}
                  outerRadius={64}
                  paddingAngle={3}
                  stroke="none"
                >
                  {slices.map((slice, i) => (
                    <Cell
                      key={slice.name}
                      fill={COST_COLORS[i % COST_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] text-[var(--muted-foreground)]">
                всего
              </span>
              <span className="text-xs font-semibold">{formatMoney(total)}</span>
            </div>
          </div>
          <ul className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs">
            {slices.map((slice, i) => (
              <li
                key={slice.name}
                className="flex items-center justify-between gap-2"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: COST_COLORS[i % COST_COLORS.length] }}
                  />
                  <span className="truncate">{slice.name}</span>
                </span>
                <span className="shrink-0 tabular-nums text-[var(--muted-foreground)]">
                  {formatMoney(slice.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}

function AiCard({ data }: { data: Dashboard }) {
  const first = data.insights[0];
      const summary =
    first?.action ??
    first?.body ??
    `Выручка за 90 дней ${formatMoney(data.commerce.revenue_90d)}. На проверке ${data.pending_review} обращений, риск OOS — ${data.commerce.oos_count} (FBO ${data.commerce.oos_fbo_count}, FBS ${data.commerce.oos_fbs_count}).`;

  return (
    <Panel fillHeight className="flex flex-col">
      <div className="min-h-0 flex-1">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--primary)]" />
          <p className="text-sm font-medium">AI-менеджер</p>
        </div>
        {first ? <p className="text-sm font-medium">{first.title}</p> : null}
        {first?.problem ? (
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {first.problem}
          </p>
        ) : null}
        <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
          {first?.action ? `→ ${summary}` : summary}
        </p>
        {first ? (
          <div className="mt-3">
            <CreateTaskButton draft={taskPayloadFromInsight(first)} />
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-[var(--muted)] px-2.5 py-1.5 text-xs">
            OOS{" "}
            <span className="font-medium text-amber-500">
              {data.commerce.oos_count}
            </span>
            <span className="text-[var(--muted-foreground)]">
              {" "}
              FBO {data.commerce.oos_fbo_count} · FBS {data.commerce.oos_fbs_count}
            </span>
          </span>
          <span className="rounded-lg bg-[var(--muted)] px-2.5 py-1.5 text-xs">
            Проверка <span className="font-medium">{data.pending_review}</span>
          </span>
          {data.marketing.has_performance_token ? (
            <span className="rounded-lg bg-[var(--muted)] px-2.5 py-1.5 text-xs">
              ДРР{" "}
              <span className="font-medium">{formatPct(data.marketing.drr)}</span>
            </span>
          ) : null}
        </div>
      </div>
      <Link
        href="/insights"
        className="mt-auto inline-block pt-4 text-xs text-[var(--muted-foreground)] underline-offset-2 hover:underline"
      >
        Открыть AI-менеджера
      </Link>
    </Panel>
  );
}

function ActionsList({ items }: { items: BriefingItem[] }) {
  return (
    <Panel fillHeight className="flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">Действия</p>
        <Link
          href="/commerce/sales"
          className="text-xs text-[var(--muted-foreground)] underline-offset-2 hover:underline"
        >
          Все
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          Срочных сигналов нет
        </p>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-2">
          {items.slice(0, 6).map((item) => (
            <li
              key={`${item.kind}-${item.sku ?? item.title}`}
              className="flex items-start justify-between gap-3 rounded-xl bg-[var(--muted)]/60 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="truncate text-xs text-[var(--muted-foreground)]">
                  {item.action}
                </p>
              </div>
              <Badge variant="secondary">
                {KIND_LABEL[item.kind] ?? item.kind}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function DashboardOverview({ data }: { data: Dashboard }) {
  const briefing = useCommerceBriefing();
  const maxDate = useMemo(() => atNoon(new Date()), []);
  const minDate = useMemo(() => rangeOfDays(90, maxDate).from, [maxDate]);
  const [range, setRange] = useState<DateRange>(() => rangeOfDays(30, maxDate));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-stretch gap-4 lg:grid-cols-3">
        <div className="min-h-0 lg:col-span-2">
          <RevenueChart data={data} range={range} />
        </div>
        <CalendarPanel
          range={range}
          minDate={minDate}
          maxDate={maxDate}
          onChange={setRange}
        />
      </div>
      <div className="grid auto-rows-fr items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardKpis data={data} range={range} />
        <HealthPanel data={data} />
      </div>
      <div className="grid auto-rows-fr items-stretch gap-4 lg:grid-cols-3">
        <AiCard data={data} />
        <CostsDonut data={data} />
        <ActionsList items={briefing.data?.items ?? []} />
      </div>
    </div>
  );
}
