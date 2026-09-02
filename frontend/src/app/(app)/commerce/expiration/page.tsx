"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { CommerceStat, formatNumber } from "@/components/commerce-ui";
import { PageHeader, QueryState } from "@/components/query-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useOzonAutoSync } from "@/components/ozon-sync-controls";
import { useCommerceExpiration } from "@/lib/hooks";
import { useCabinet } from "@/lib/marketplace-cabinet";
import type { ExpirationSkuItem } from "@/lib/types";

function riskBadge(item: ExpirationSkuItem) {
  if (item.expiring > 0) return { label: "Предпросрок", variant: "destructive" as const };
  if (item.defect > 0) return { label: "Брак", variant: "warning" as const };
  return { label: "Превалид", variant: "secondary" as const };
}

export default function CommerceExpirationPage() {
  const { selected } = useCabinet();
  const isWbOnly = selected?.type === "wb";
  const expiration = useCommerceExpiration();
  useOzonAutoSync("commerce");
  const [query, setQuery] = useState("");
  const [openSku, setOpenSku] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const items = expiration.data?.items ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const hay = `${item.sku} ${item.title ?? ""} ${item.offer_id ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [expiration.data?.items, query]);

  return (
    <div>
      <PageHeader
        title="Сроки годности"
        description="Предпросрок FBO: товары, у которых на складе Ozon истекает срок годности"
      />

      {isWbOnly ? (
        <Notice className="mb-4">
          Коммерческая аналитика доступна только для Ozon. Выберите кабинет Ozon
          в селекторе слева.
        </Notice>
      ) : null}

      {isWbOnly ? null : (
        <QueryState
          isLoading={expiration.isLoading}
          isError={expiration.isError}
          isEmpty={false}
        >
          {expiration.data ? (
            <>
              <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <CommerceStat
                  label="Предпросрок, шт"
                  value={formatNumber(expiration.data.expiring_units)}
                />
                <CommerceStat
                  label="SKU с риском"
                  value={expiration.data.sku_count}
                />
                <CommerceStat
                  label="Брак, шт"
                  value={formatNumber(expiration.data.defect_units)}
                />
                <CommerceStat
                  label="Превалид, шт"
                  value={formatNumber(expiration.data.waiting_docs_units)}
                />
              </div>
              {expiration.data.captured_at ? (
                <p className="mb-4 text-xs text-[var(--muted-foreground)]">
                  Обновлено:{" "}
                  {new Date(expiration.data.captured_at).toLocaleString("ru-RU")}
                </p>
              ) : null}

              {expiration.data.items.length === 0 ? (
                <Notice variant="info">
                  Нет остатков с истекающим сроком годности, браком или
                  превалидом. Раздел нужен продавцам продуктов, косметики, БАДов
                  и других товаров, у которых Ozon учитывает срок годности на
                  FBO.
                </Notice>
              ) : (
                <section className="mb-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Товары с риском</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-3 text-sm text-[var(--muted-foreground)]">
                        Предпросрок — товар на складе Ozon с истекающим сроком.
                        Его нужно быстрее продать или вывезти, иначе утилизация.
                      </p>
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="SKU или название"
                        className="mb-4 w-full max-w-sm rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
                      />
                      {filtered.length === 0 ? (
                        <p className="text-sm text-[var(--muted-foreground)]">
                          Ничего не найдено.
                        </p>
                      ) : (
                        <Table>
                          <THead>
                            <TR>
                              <TH className="w-8" />
                              <TH>Товар</TH>
                              <TH>Статус</TH>
                              <TH className="text-right">Предпросрок</TH>
                              <TH className="text-right">Доступно</TH>
                            </TR>
                          </THead>
                          <TBody>
                            {filtered.map((item) => (
                              <ExpirationRow
                                key={item.sku}
                                item={item}
                                open={openSku === item.sku}
                                onToggle={() =>
                                  setOpenSku((cur) =>
                                    cur === item.sku ? null : item.sku,
                                  )
                                }
                              />
                            ))}
                          </TBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </section>
              )}
            </>
          ) : null}
        </QueryState>
      )}
    </div>
  );
}

function ExpirationRow({
  item,
  open,
  onToggle,
}: {
  item: ExpirationSkuItem;
  open: boolean;
  onToggle: () => void;
}) {
  const badge = riskBadge(item);
  const expandable = item.warehouses.length > 0;
  return (
    <>
      <TR
        className={expandable ? "cursor-pointer" : undefined}
        onClick={expandable ? onToggle : undefined}
      >
        <TD className="w-8 text-[var(--muted-foreground)]">
          {expandable ? (
            open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : null}
        </TD>
        <TD>
          <div className="font-medium">{item.title ?? item.sku}</div>
          <div className="text-xs text-[var(--muted-foreground)]">
            {item.sku}
            {item.offer_id && item.offer_id !== item.sku
              ? ` · ${item.offer_id}`
              : ""}
          </div>
        </TD>
        <TD>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </TD>
        <TD className="text-right tabular-nums">
          {item.expiring > 0 ? formatNumber(item.expiring) : "—"}
        </TD>
        <TD className="text-right tabular-nums">{formatNumber(item.present)}</TD>
      </TR>
      {open ? (
        <TR>
          <TD />
          <TD colSpan={4} className="pb-4">
            <p className="mb-2 text-sm">{item.action}</p>
            {item.days_to_sell != null ? (
              <p className="mb-2 text-xs text-[var(--muted-foreground)]">
                При текущих продажах предпросрок уйдёт ~{item.days_to_sell} дн.
              </p>
            ) : null}
            {item.warehouses.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {item.warehouses.map((wh) => (
                  <li
                    key={`${wh.warehouse_id}-${wh.warehouse_name}`}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="truncate">
                      {wh.warehouse_name || `Склад ${wh.warehouse_id}`}
                    </span>
                    <span className="shrink-0 tabular-nums text-[var(--muted-foreground)]">
                      {[
                        wh.expiring > 0
                          ? `предпросрок ${formatNumber(wh.expiring)}`
                          : null,
                        wh.defect > 0 ? `брак ${formatNumber(wh.defect)}` : null,
                        wh.waiting_docs > 0
                          ? `превалид ${formatNumber(wh.waiting_docs)}`
                          : null,
                        wh.present > 0
                          ? `доступно ${formatNumber(wh.present)}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </TD>
        </TR>
      ) : null}
    </>
  );
}
