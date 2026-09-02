"use client";

import {
  CommerceStat,
  formatMoney,
} from "@/components/commerce-ui";
import { PlacementForecast } from "@/components/placement-forecast";
import { PageHeader, QueryState } from "@/components/query-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { useOzonAutoSync } from "@/components/ozon-sync-controls";
import { useCommercePlacement } from "@/lib/hooks";
import { useCabinet } from "@/lib/marketplace-cabinet";

export default function CommerceStoragePage() {
  const { selected } = useCabinet();
  const isWbOnly = selected?.type === "wb";
  const placement = useCommercePlacement();
  useOzonAutoSync("commerce");

  return (
    <div>
      <PageHeader
        title="Хранение"
        description="Платное хранение FBO: уже платные SKU, конец льготы и прогноз"
      />

      {isWbOnly ? (
        <Notice className="mb-4">
          Коммерческая аналитика доступна только для Ozon. Выберите кабинет Ozon
          в селекторе слева.
        </Notice>
      ) : null}

      {isWbOnly ? null : (
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Платное хранение FBO</CardTitle>
            </CardHeader>
            <CardContent>
              <QueryState
                isLoading={placement.isLoading}
                isError={placement.isError}
                isEmpty={
                  (placement.data?.paid.length ?? 0) === 0 &&
                  (placement.data?.soon.length ?? 0) === 0 &&
                  (placement.data?.supplies.length ?? 0) === 0
                }
                emptyText="Нет данных по размещению. Синхронизация с Ozon идёт автоматически."
              >
                {placement.data ? (
                  <>
                    <p className="mb-3 text-sm text-[var(--muted-foreground)]">
                      Уже платные SKU и поставки, у которых скоро закончится
                      льготный период.
                      {placement.data.captured_at
                        ? ` Обновлено: ${new Date(placement.data.captured_at).toLocaleString("ru-RU")}.`
                        : null}
                    </p>
                    <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
                      <CommerceStat
                        label="SKU уже платные"
                        value={placement.data.paid_sku_count}
                      />
                      <CommerceStat
                        label="Скоро станут платными"
                        value={placement.data.soon_sku_count}
                      />
                      <CommerceStat
                        label="Начислено сегодня"
                        value={formatMoney(placement.data.fee_today)}
                      />
                      <CommerceStat
                        label="За период отчёта"
                        value={formatMoney(placement.data.fee_period)}
                      />
                      <CommerceStat
                        label="Прогноз 30 дней"
                        value={formatMoney(placement.data.forecast_total)}
                      />
                    </div>

                    <h3 className="mb-2 text-sm font-medium">Уже платное</h3>
                    {placement.data.paid.length === 0 ? (
                      <p className="mb-4 text-sm text-[var(--muted-foreground)]">
                        Сейчас платных остатков нет.
                      </p>
                    ) : (
                      <ul className="mb-6 flex flex-col gap-2">
                        {placement.data.paid.map((item) => (
                          <li
                            key={`paid-${item.sku}`}
                            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-sm"
                          >
                            <span className="truncate font-medium">
                              {item.title ?? item.sku}
                              <span className="text-[var(--muted-foreground)]">
                                {" "}
                                · {item.sku}
                              </span>
                            </span>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className="tabular-nums">
                                {item.paid_units}/{item.units} шт
                              </span>
                              <Badge variant="destructive">
                                {formatMoney(item.fee_amount)}/день
                              </Badge>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    <h3 className="mb-2 text-sm font-medium">
                      Скоро станет платным
                    </h3>
                    {placement.data.soon.length === 0 &&
                    placement.data.supplies.length === 0 ? (
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Нет поставок с близким концом льготы.
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {(placement.data.soon.length > 0
                          ? placement.data.soon
                          : []
                        ).map((item) => (
                          <li
                            key={`soon-${item.sku}`}
                            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-sm"
                          >
                            <span className="truncate font-medium">
                              {item.title ?? item.sku}
                              <span className="text-[var(--muted-foreground)]">
                                {" "}
                                · {item.sku}
                              </span>
                            </span>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className="tabular-nums">
                                {item.units} шт
                              </span>
                              <Badge variant="warning">
                                {item.days_until_paid != null
                                  ? `через ${item.days_until_paid} дн.`
                                  : item.status_label}
                              </Badge>
                              {item.becomes_paid_on ? (
                                <span className="text-xs text-[var(--muted-foreground)]">
                                  {new Date(
                                    `${item.becomes_paid_on}T12:00:00`,
                                  ).toLocaleDateString("ru-RU")}
                                </span>
                              ) : null}
                            </div>
                          </li>
                        ))}
                        {placement.data.supplies
                          .filter(
                            (s) =>
                              s.days_until_paid != null &&
                              s.days_until_paid <= 30,
                          )
                          .slice(0, 20)
                          .map((s) => (
                            <li
                              key={`${s.sku}-${s.supply_number}`}
                              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-sm"
                            >
                              <span className="truncate">
                                <span className="font-medium">{s.sku}</span>
                                <span className="text-[var(--muted-foreground)]">
                                  {" "}
                                  · поставка {s.supply_number}
                                  {s.warehouse ? ` · ${s.warehouse}` : ""}
                                </span>
                              </span>
                              <div className="flex shrink-0 items-center gap-2">
                                <Badge variant="warning">
                                  через {s.days_until_paid} дн.
                                </Badge>
                                {s.becomes_paid_on ? (
                                  <span className="text-xs text-[var(--muted-foreground)]">
                                    {new Date(
                                      `${s.becomes_paid_on}T12:00:00`,
                                    ).toLocaleDateString("ru-RU")}
                                  </span>
                                ) : null}
                              </div>
                            </li>
                          ))}
                      </ul>
                    )}

                    <PlacementForecast data={placement.data} />
                  </>
                ) : null}
              </QueryState>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
