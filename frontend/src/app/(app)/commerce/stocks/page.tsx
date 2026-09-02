"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { CreateTaskButton } from "@/components/create-task-button";
import {
  CommerceStat,
  formatNumber,
} from "@/components/commerce-ui";
import { PageHeader, QueryState } from "@/components/query-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useOzonAutoSync } from "@/components/ozon-sync-controls";
import { useCommerceOos, useCommerceStocks } from "@/lib/hooks";
import { useCabinet } from "@/lib/marketplace-cabinet";
import type {
  InTransitItem,
  OosItem,
  StockSkuItem,
  StockWarehouseCell,
} from "@/lib/types";
import { taskPayloadFromOos } from "@/lib/task-from-source";
import { cn } from "@/lib/utils";

function transitKinds(item: InTransitItem): string[] {
  const labels: string[] = [];
  if (item.in_transit > 0) labels.push(`в пути ${formatNumber(item.in_transit)}`);
  if (item.requested > 0) labels.push(`в заявке ${formatNumber(item.requested)}`);
  if (item.arriving > 0) {
    labels.push(`ожидает размещения ${formatNumber(item.arriving)}`);
  }
  return labels;
}

function WarehouseList({
  title,
  rows,
}: {
  title: string;
  rows: StockWarehouseCell[];
}) {
  if (rows.length === 0) return null;
  return (
    <div className="mt-2">
      <div className="mb-1 text-xs font-medium text-[var(--muted-foreground)]">
        {title}
      </div>
      <ul className="flex flex-col gap-1">
        {rows.map((wh) => (
          <li
            key={`${wh.warehouse_id}-${wh.warehouse_name}`}
            className="flex items-center justify-between gap-2 text-xs"
          >
            <span className="truncate">
              {wh.warehouse_name || `Склад ${wh.warehouse_id}`}
            </span>
            <span className="shrink-0 tabular-nums text-[var(--muted-foreground)]">
              {formatNumber(wh.present)} шт
              {wh.in_transit > 0 ? ` · в пути ${formatNumber(wh.in_transit)}` : ""}
              {wh.reserved > 0 ? ` · рез. ${formatNumber(wh.reserved)}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CommerceStocksPage() {
  const { selected } = useCabinet();
  const isWbOnly = selected?.type === "wb";
  const stocks = useCommerceStocks();
  const oos = useCommerceOos();
  useOzonAutoSync("commerce");
  const [query, setQuery] = useState("");
  const [openSku, setOpenSku] = useState<string | null>(null);

  const oosBySku = useMemo(() => {
    const map = new Map<string, OosItem>();
    for (const item of oos.data ?? []) {
      map.set(item.sku, item);
    }
    return map;
  }, [oos.data]);

  const filtered = useMemo(() => {
    const items = stocks.data?.items ?? [];
    const q = query.trim().toLowerCase();
    const matched = !q
      ? items
      : items.filter((item) => {
          const hay = `${item.sku} ${item.title ?? ""} ${item.offer_id ?? ""}`.toLowerCase();
          return hay.includes(q);
        });
    return [...matched].sort((a, b) => {
      const aOos = oosBySku.has(a.sku) ? 0 : 1;
      const bOos = oosBySku.has(b.sku) ? 0 : 1;
      if (aOos !== bOos) return aOos - bOos;
      return a.fbo + a.fbs - (b.fbo + b.fbs);
    });
  }, [stocks.data?.items, query, oosBySku]);

  return (
    <div>
      <PageHeader
        title="Остатки"
        description="FBO и FBS по складам, товары в пути на склад Ozon"
      />

      {isWbOnly ? (
        <Notice className="mb-4">
          Коммерческая аналитика доступна только для Ozon. Выберите кабинет Ozon
          в селекторе слева.
        </Notice>
      ) : null}

      {isWbOnly ? null : (
        <QueryState
          isLoading={stocks.isLoading}
          isError={stocks.isError}
          isEmpty={
            (stocks.data?.items.length ?? 0) === 0 &&
            (stocks.data?.in_transit.length ?? 0) === 0
          }
          emptyText="Нет данных по остаткам. Синхронизация с Ozon идёт автоматически."
        >
          {stocks.data ? (
            <>
              <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <CommerceStat
                  label="FBO, шт"
                  value={formatNumber(stocks.data.fbo_units)}
                />
                <CommerceStat
                  label="FBS, шт"
                  value={formatNumber(stocks.data.fbs_units)}
                />
                <CommerceStat
                  label="В пути, шт"
                  value={formatNumber(stocks.data.in_transit_units)}
                />
                <CommerceStat
                  label="SKU с остатком"
                  value={stocks.data.sku_count}
                />
              </div>
              {stocks.data.captured_at ? (
                <p className="mb-4 text-xs text-[var(--muted-foreground)]">
                  Обновлено:{" "}
                  {new Date(stocks.data.captured_at).toLocaleString("ru-RU")}
                </p>
              ) : null}

              {stocks.data.in_transit.length > 0 ? (
                <section className="mb-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>В пути на склад</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-3 text-sm text-[var(--muted-foreground)]">
                        Поставки в пути, заявки и товар, который скоро разместят
                        на складе FBO.
                        {stocks.data.requested_units > 0
                          ? ` В заявках: ${formatNumber(stocks.data.requested_units)} шт.`
                          : ""}
                        {stocks.data.arriving_units > 0
                          ? ` Ожидает размещения: ${formatNumber(stocks.data.arriving_units)} шт.`
                          : ""}
                      </p>
                      <ul className="flex flex-col gap-2">
                        {stocks.data.in_transit.map((item) => (
                          <li
                            key={`${item.sku}-${item.scheme}-${item.warehouse_name}`}
                            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-sm"
                          >
                            <span className="truncate">
                              <span className="font-medium">
                                {item.title ?? item.sku}
                              </span>
                              <span className="text-[var(--muted-foreground)]">
                                {" "}
                                · {item.sku}
                                {item.warehouse_name
                                  ? ` · ${item.warehouse_name}`
                                  : ""}
                              </span>
                            </span>
                            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                              <Badge variant="secondary">{item.scheme}</Badge>
                              {transitKinds(item).map((label) => (
                                <Badge key={label} variant="warning">
                                  {label}
                                </Badge>
                              ))}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </section>
              ) : null}

              <section className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Остатки по товарам</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {oosBySku.size > 0 ? (
                      <p className="mb-3 text-sm text-amber-500">
                        OOS: {formatNumber(oosBySku.size)} SKU с продажами, запаса
                        меньше 14 дней — вверху списка.
                      </p>
                    ) : null}
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
                            <TH className="text-right">FBO</TH>
                            <TH className="text-right">FBS</TH>
                            <TH className="text-right">В пути</TH>
                          </TR>
                        </THead>
                        <TBody>
                          {filtered.map((item) => (
                            <StockRow
                              key={item.sku}
                              item={item}
                              oos={oosBySku.get(item.sku)}
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
            </>
          ) : null}
        </QueryState>
      )}
    </div>
  );
}

function StockRow({
  item,
  oos,
  open,
  onToggle,
}: {
  item: StockSkuItem;
  oos?: OosItem;
  open: boolean;
  onToggle: () => void;
}) {
  const expandable =
    item.fbo_warehouses.length > 0 || item.fbs_warehouses.length > 0;
  const channels = oos
    ? [
        (oos.available_fbo ?? oos.fbo ?? 0) <= 0 ? "FBO" : null,
        (oos.available_fbs ?? oos.fbs ?? 0) <= 0 ? "FBS" : null,
      ].filter(Boolean)
    : [];
  const days =
    oos?.idc != null && Number(oos.idc) >= 0
      ? `${Math.round(Number(oos.idc))} дн.`
      : null;
  return (
    <>
      <TR
        className={cn(
          expandable ? "cursor-pointer" : undefined,
          oos ? "bg-amber-500/10" : undefined,
        )}
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{item.title ?? item.sku}</span>
            {oos ? (
              <Badge variant="warning">
                OOS
                {channels.length > 0 ? ` ${channels.join("/")}` : ""}
                {days ? ` · ${days}` : ""}
              </Badge>
            ) : null}
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">
            {item.sku}
            {item.offer_id && item.offer_id !== item.sku ? ` · ${item.offer_id}` : ""}
          </div>
          {oos ? <CreateTaskButton draft={taskPayloadFromOos(oos)} /> : null}
        </TD>
        <TD
          className={cn(
            "text-right tabular-nums",
            oos && (oos.available_fbo ?? oos.fbo ?? 0) <= 0 && "text-amber-500",
          )}
        >
          {formatNumber(item.fbo)}
        </TD>
        <TD
          className={cn(
            "text-right tabular-nums",
            oos && (oos.available_fbs ?? oos.fbs ?? 0) <= 0 && "text-amber-500",
          )}
        >
          {formatNumber(item.fbs)}
        </TD>
        <TD className="text-right tabular-nums">
          {item.in_transit > 0 ? formatNumber(item.in_transit) : "—"}
        </TD>
      </TR>
      {open && expandable ? (
        <TR>
          <TD />
          <TD colSpan={4} className="pb-4">
            <WarehouseList title="Склады FBO" rows={item.fbo_warehouses} />
            <WarehouseList title="Склады FBS" rows={item.fbs_warehouses} />
          </TD>
        </TR>
      ) : null}
    </>
  );
}
