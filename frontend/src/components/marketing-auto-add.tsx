"use client";

import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { QueryState } from "@/components/query-state";
import { MarketingSection } from "@/components/marketing-ui";
import { ApiError } from "@/lib/api";
import {
  useAutoAddProducts,
  useDeleteAutoAddProducts,
} from "@/lib/hooks";
import {
  formatDateTime,
  formatMoney,
  formatNumber,
} from "@/lib/marketing-format";
import type { AutoAddProductItem, AutoAddProductRef } from "@/lib/types";
import { useState } from "react";

function itemKey(item: AutoAddProductRef): string {
  return `${item.action_id}:${item.auto_add_date}:${item.product_id}`;
}

function toRef(item: AutoAddProductItem): AutoAddProductRef {
  return {
    action_id: item.action_id,
    auto_add_date: item.auto_add_date,
    product_id: item.product_id,
  };
}

export function AutoAddSection() {
  const products = useAutoAddProducts();
  const remove = useDeleteAutoAddProducts();
  const items = products.data?.items ?? [];
  const keys = items.map((item) => itemKey(item));
  const { selected, toggle, toggleAll, clear } = useSelection(keys);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const errorText =
    remove.error instanceof ApiError
      ? remove.error.message
      : remove.error instanceof Error
        ? remove.error.message
        : null;

  async function onDelete(refs: AutoAddProductRef[]) {
    const label =
      refs.length === 1
        ? "Убрать этот товар из автоакций?"
        : `Убрать ${refs.length} товаров из автоакций?`;
    if (!window.confirm(label)) return;
    const first = refs[0];
    setBusyKey(refs.length === 1 && first ? itemKey(first) : "bulk");
    try {
      await remove.mutateAsync(refs);
      clear();
    } catch (e) {
      console.error(
        e instanceof ApiError ? e.message : "Не удалось убрать товары",
      );
    } finally {
      setBusyKey(null);
    }
  }

  const selectedRefs = items
    .filter((item) => selected.has(itemKey(item)))
    .map(toRef);

  return (
    <MarketingSection
      title="Автоакции"
      why="Товары, которые Ozon сам добавляет в промо. Можно убрать из автодобавления."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={products.isFetching}
          onClick={() => void products.refetch()}
        >
          {products.isFetching ? "Обновление…" : "Обновить список"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={remove.isPending || selectedRefs.length === 0}
          onClick={() => void onDelete(selectedRefs)}
        >
          Убрать выбранные
          {selectedRefs.length ? ` (${formatNumber(selectedRefs.length)})` : ""}
        </Button>
        {products.data ? (
          <span className="text-sm text-[var(--muted-foreground)]">
            Всего:{" "}
            <span className="font-medium text-[var(--foreground)]">
              {formatNumber(products.data.total)}
            </span>
          </span>
        ) : null}
      </div>

      {errorText ? <Notice className="mb-4">{errorText}</Notice> : null}

      {remove.isSuccess ? (
        <Notice className="mb-4" variant="info">
          Убрано из автоакций: {formatNumber(remove.data.deleted_count)}
        </Notice>
      ) : null}

      <QueryState
        isLoading={products.isLoading}
        isError={products.isError}
        isEmpty={items.length === 0}
        emptyText="Нет товаров в автодобавлении."
        errorText={
          products.error instanceof ApiError
            ? products.error.message
            : "Не удалось загрузить данные"
        }
      >
        <AutoAddProductsTable
          items={items}
          busyKey={busyKey}
          selected={selected}
          onToggle={toggle}
          onToggleAll={toggleAll}
          onDelete={(refs) => void onDelete(refs)}
        />
      </QueryState>
    </MarketingSection>
  );
}

function AutoAddProductsTable({
  items,
  busyKey,
  selected,
  onToggle,
  onToggleAll,
  onDelete,
}: {
  items: AutoAddProductItem[];
  busyKey: string | null;
  selected: Set<string>;
  onToggle: (key: string) => void;
  onToggleAll: () => void;
  onDelete: (refs: AutoAddProductRef[]) => void;
}) {
  const allSelected = items.length > 0 && selected.size === items.length;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
            <th className="w-8 pb-2 pr-3 font-medium">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Выбрать все"
              />
            </th>
            <th className="pb-2 pr-3 font-medium">Товар</th>
            <th className="pb-2 pr-3 font-medium">Акция</th>
            <th className="pb-2 pr-3 font-medium">Дата</th>
            <th className="pb-2 pr-3 font-medium">Цена / авто</th>
            <th className="pb-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const key = itemKey(item);
            const busy = busyKey === key || busyKey === "bulk";
            return (
              <tr key={key} className="border-b border-[var(--border)]/60">
                <td className="py-2 pr-3">
                  <input
                    type="checkbox"
                    checked={selected.has(key)}
                    onChange={() => onToggle(key)}
                    aria-label={`Выбрать ${item.title ?? item.offer_id ?? item.product_id}`}
                  />
                </td>
                <td className="py-2 pr-3">
                  <div className="max-w-[260px] truncate font-medium">
                    {item.title ?? item.offer_id ?? `ID ${item.product_id}`}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {item.sku ? `SKU ${item.sku}` : `ID ${item.product_id}`}
                    {item.add_mode ? ` · ${item.add_mode}` : ""}
                  </div>
                </td>
                <td className="py-2 pr-3">
                  <div className="max-w-[200px] truncate">{item.action_title}</div>
                </td>
                <td className="py-2 pr-3 text-xs text-[var(--muted-foreground)]">
                  {formatDateTime(item.auto_add_date)}
                </td>
                <td className="py-2 pr-3">
                  <div>{formatMoney(item.price)}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {formatMoney(item.action_price)}
                  </div>
                </td>
                <td className="py-2 text-right">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => onDelete([toRef(item)])}
                  >
                    {busy && busyKey === key ? "Удаление…" : "Убрать"}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function useSelection(ids: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const known = new Set(ids);
  const visible = new Set([...selected].filter((id) => known.has(id)));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      const allOn = ids.length > 0 && ids.every((id) => prev.has(id));
      return allOn ? new Set() : new Set(ids);
    });
  }

  function clear() {
    setSelected(new Set());
  }

  return { selected: visible, toggle, toggleAll, clear };
}
