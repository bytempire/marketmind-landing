"use client";

import { BriefingCard } from "@/components/briefing-card";
import {
  CommerceStat,
  formatMoney,
  formatNumber,
} from "@/components/commerce-ui";
import { PageHeader, QueryState } from "@/components/query-state";
import { SalesChartSection } from "@/components/sales-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { useOzonAutoSync } from "@/components/ozon-sync-controls";
import {
  useCommerceSummary,
  useCommerceTurnover,
} from "@/lib/hooks";
import { useCabinet } from "@/lib/marketplace-cabinet";

export default function CommerceSalesPage() {
  const { selected } = useCabinet();
  const isWbOnly = selected?.type === "wb";
  const summary = useCommerceSummary();
  const turnover = useCommerceTurnover();
  useOzonAutoSync("commerce");

  return (
    <div>
      <PageHeader
        title="Продажи"
        description="Выручка, динамика продаж и оборачиваемость остатков Ozon"
      />

      {isWbOnly ? (
        <Notice className="mb-4">
          Коммерческая аналитика доступна только для Ozon. Выберите кабинет Ozon
          в селекторе слева.
        </Notice>
      ) : null}

      {isWbOnly ? null : (
        <>
          <div className="mb-8">
            <BriefingCard showLink={false} title="Сделать сегодня" />
          </div>

          <QueryState isLoading={summary.isLoading} isError={summary.isError}>
            {summary.data ? (
              <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <CommerceStat
                  label="Выручка за 90 дней"
                  value={formatMoney(summary.data.revenue_90d)}
                />
                <CommerceStat
                  label="Заказано единиц"
                  value={summary.data.ordered_units_90d}
                />
                <CommerceStat
                  label="Риск нулевого остатка"
                  value={summary.data.oos_count}
                />
                <CommerceStat
                  label="Товары с дорогим индексом"
                  value={summary.data.red_price_count}
                />
              </div>
            ) : null}
          </QueryState>

          <SalesChartSection />

          <section className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Оборачиваемость</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-[var(--muted-foreground)]">
                  На сколько дней хватит текущего остатка при текущих продажах
                  (IDC из Ozon).
                </p>
                <QueryState
                  isLoading={turnover.isLoading}
                  isError={turnover.isError}
                  isEmpty={turnover.data?.length === 0}
                  emptyText="Нет данных по оборачиваемости. Синхронизация с Ozon идёт автоматически."
                >
                  <div className="mb-2 grid grid-cols-[minmax(0,1fr)_4.5rem_7rem] gap-2 text-xs text-[var(--muted-foreground)] sm:grid-cols-[minmax(0,1fr)_5rem_8rem_auto]">
                    <span>SKU</span>
                    <span className="text-right">шт</span>
                    <span className="text-right">Оборачиваемость</span>
                    <span className="hidden sm:block" />
                  </div>
                  <ul className="flex flex-col gap-2">
                    {turnover.data?.map((item) => (
                      <li
                        key={item.sku}
                        className="grid grid-cols-[minmax(0,1fr)_4.5rem_7rem] items-center gap-2 text-sm sm:grid-cols-[minmax(0,1fr)_5rem_8rem_auto]"
                      >
                        <span className="truncate font-medium">{item.sku}</span>
                        <span className="text-right tabular-nums">
                          {formatNumber(item.current_stock)} шт
                        </span>
                        <span className="text-right tabular-nums">
                          {item.idc != null
                            ? `${formatNumber(Number(item.idc))} дн.`
                            : "—"}
                        </span>
                        <span className="hidden justify-self-end sm:flex">
                          {item.turnover_grade_label || item.turnover_grade ? (
                            <Badge
                              variant={
                                (item.turnover_grade ?? "")
                                  .toUpperCase()
                                  .includes("DEFICIT") ||
                                (item.turnover_grade ?? "")
                                  .toUpperCase()
                                  .includes("CRITICAL")
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {item.turnover_grade_label ?? item.turnover_grade}
                            </Badge>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </QueryState>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
