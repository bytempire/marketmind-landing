"use client";

import { useState } from "react";

import { CommerceStat, formatMoney, healthStatusVariant } from "@/components/commerce-ui";
import { EconomicsWaterfall } from "@/components/economics-waterfall";
import { QueryState } from "@/components/query-state";
import { rangeOfDays, toIsoDate } from "@/components/range-calendar";
import { SkuEconomicsTable } from "@/components/sku-economics-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import {
  useCommerceCabinetHealth,
  useCommerceEconomics,
  usePatchProductCost,
  usePatchSkuExpense,
} from "@/lib/hooks";
import { useCabinet } from "@/lib/marketplace-cabinet";

function lastClosedMonth(today = new Date()) {
  const offset = today.getDate() >= 6 ? 1 : 2;
  const from = new Date(today.getFullYear(), today.getMonth() - offset, 1, 12);
  const to = new Date(from.getFullYear(), from.getMonth() + 1, 0, 12);
  return { from, to };
}

export default function CommerceEconomicsPage() {
  const { marketplaceId } = useCabinet();
  const [period, setPeriod] = useState<"90d" | "month">("90d");
  const range = period === "month" ? lastClosedMonth() : rangeOfDays(90);
  const economics = useCommerceEconomics(toIsoDate(range.from), toIsoDate(range.to));
  const health = useCommerceCabinetHealth();
  const patchCost = usePatchProductCost();
  const patchExpense = usePatchSkuExpense();
  const data = economics.data;

  return (
    <div>
      <div className="mb-4 flex gap-1">
        <PeriodChip
          active={period === "90d"}
          label="90 дней"
          onClick={() => setPeriod("90d")}
        />
        <PeriodChip
          active={period === "month"}
          label="Прошлый месяц"
          onClick={() => setPeriod("month")}
        />
      </div>

      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Юнит-экономика</CardTitle>
          </CardHeader>
          <CardContent>
            <QueryState
              isLoading={economics.isLoading}
              isError={economics.isError}
            >
              {data ? (
                <>
                  <p className="mb-3 text-sm text-[var(--muted-foreground)]">
                    Зелёным — зарабатываем, красным — просадка. Наведите на
                    название показателя.
                  </p>
                  {data.missing_cogs_sku_count > 0 ? (
                    <Notice className="mb-3">
                      Нет себестоимости у {data.missing_cogs_sku_count} SKU —
                      прибыль занижена. Задайте закупку в таблице ниже.
                    </Notice>
                  ) : null}
                  <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <CommerceStat
                      label="Выручка"
                      value={formatMoney(data.revenue)}
                      hint="Сумма выкупленных продаж. Не заказы: невыкуп сюда не входит."
                    />
                    <CommerceStat
                      label="Прибыль с товаров"
                      value={formatMoney(data.contribution_margin)}
                      hint="Выручка минус закупка, Ozon и реклама. Без аренды и зарплаты."
                      tone={profitTone(data.contribution_margin)}
                    />
                    <CommerceStat
                      label="Чистая прибыль"
                      value={formatMoney(data.net_profit)}
                      hint="После постоянных расходов и налога. Итог кабинета за период."
                      tone={profitTone(data.net_profit)}
                    />
                    <CommerceStat
                      label="Выкуп"
                      value={
                        data.buyout_rate != null
                          ? `${Number(data.buyout_rate).toFixed(0)}%`
                          : "—"
                      }
                      hint={`Дошло ${data.delivered_units} из ${data.ordered_units} заказанных. Ниже — больше отмен и возвратов.`}
                    />
                  </div>
                  <EconomicsWaterfall steps={data.waterfall} />
                </>
              ) : null}
            </QueryState>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>По SKU</CardTitle>
          </CardHeader>
          <CardContent>
            <QueryState
              isLoading={economics.isLoading}
              isError={economics.isError}
              isEmpty={(data?.by_sku.length ?? 0) === 0}
              emptyText="Нет продаж за период."
            >
              {data ? (
                <>
                  <p className="mb-3 text-xs text-[var(--muted-foreground)]">
                    Каждый товар: плюс или минус после закупки, Ozon и рекламы.
                    Постоянные расходы кабинета в этой таблице нет.
                  </p>
                  <SkuEconomicsTable
                    rows={data.by_sku}
                    disabled={
                      patchCost.isPending ||
                      patchExpense.isPending ||
                      !marketplaceId
                    }
                    onSaveCost={(productId, amount) =>
                      patchCost.mutate({ productId, amount })
                    }
                    onSaveExpense={(productId, values) =>
                      patchExpense.mutate({ productId, values })
                    }
                  />
                </>
              ) : null}
            </QueryState>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Рейтинг кабинета</CardTitle>
          </CardHeader>
          <CardContent>
            <QueryState
              isLoading={health.isLoading}
              isError={health.isError}
              isEmpty={health.data?.items.length === 0}
              emptyText="Нет применимых показателей рейтинга. Синхронизация с Ozon идёт автоматически."
            >
              {health.data?.captured_at ? (
                <p className="mb-3 text-sm text-[var(--muted-foreground)]">
                  Обновлено:{" "}
                  {new Date(health.data.captured_at).toLocaleString("ru-RU")}
                </p>
              ) : null}
              <ul className="flex flex-col gap-2">
                {health.data?.items.map((item) => (
                  <li
                    key={`${item.group_name}-${item.rating}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate pr-2">
                      {item.name ?? item.rating}
                      {item.group_name ? (
                        <span className="text-[var(--muted-foreground)]">
                          {" "}
                          · {item.group_name}
                        </span>
                      ) : null}
                    </span>
                    <div className="flex shrink-0 items-center gap-2">
                      {item.current_value != null ? (
                        <span>{item.current_value}</span>
                      ) : null}
                      {item.status_label || item.status ? (
                        <Badge variant={healthStatusVariant(item.status)}>
                          {item.status_label ?? item.status}
                        </Badge>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </QueryState>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function profitTone(value: string | number): "up" | "down" | "neutral" {
  const n = Number(value);
  if (n > 0) return "up";
  if (n < 0) return "down";
  return "neutral";
}

function PeriodChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full border border-[var(--primary)] bg-[var(--primary)] px-2.5 py-1 text-xs text-[var(--primary-foreground)]"
          : "rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      }
    >
      {label}
    </button>
  );
}
