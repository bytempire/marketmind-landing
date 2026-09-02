"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  actionTypeLabel,
  formatDateTime,
  formatMoney,
  formatNumber,
} from "@/lib/marketing-format";
import type { ActionItem } from "@/lib/types";
import { useState } from "react";

export function ActionsSection({ items }: { items: ActionItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">
        Акций пока нет. Нужен кабинет Ozon с Seller API: подключите его в
        «Кабинетах» и выберите слева — список подтянется сам.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {items.map((action) => {
        const open = openId === action.external_id;
        const products = action.products;
        return (
          <div
            key={action.external_id}
            className="border-b border-[var(--border)]/60 pb-4 last:border-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{action.title}</div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <Badge
                    variant={action.is_participating ? "success" : "secondary"}
                  >
                    {action.is_participating ? "Участвуете" : "Не участвуете"}
                  </Badge>
                  <Badge variant="secondary">
                    {actionTypeLabel(action.action_type)}
                  </Badge>
                  {action.is_voucher_action ? (
                    <Badge variant="secondary">Промокод</Badge>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  {formatDateTime(action.date_start)} —{" "}
                  {formatDateTime(action.date_end)}
                </p>
              </div>
              <div className="shrink-0 text-right text-xs text-[var(--muted-foreground)]">
                <div>
                  В акции:{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    {formatNumber(action.participating_products_count)}
                  </span>
                </div>
                <div className="mt-1">
                  Можно добавить:{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    {formatNumber(action.potential_products_count)}
                  </span>
                </div>
              </div>
            </div>
            {products.length > 0 ? (
              <div className="mt-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setOpenId(open ? null : action.external_id)}
                >
                  {open
                    ? "Скрыть товары"
                    : `Товары в акции (${products.length})`}
                </Button>
                {open ? (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                          <th className="pb-2 pr-3 font-medium">Товар</th>
                          <th className="pb-2 pr-3 font-medium">Цена</th>
                          <th className="pb-2 pr-3 font-medium">Цена акции</th>
                          <th className="pb-2 font-medium">Остаток</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.slice(0, 50).map((p) => (
                          <tr
                            key={p.product_external_id}
                            className="border-b border-[var(--border)]/60"
                          >
                            <td className="py-2 pr-3">
                              <div className="max-w-[220px] truncate font-medium">
                                {p.title ?? `ID ${p.product_external_id}`}
                              </div>
                              {p.sku ? (
                                <div className="text-xs text-[var(--muted-foreground)]">
                                  SKU {p.sku}
                                </div>
                              ) : null}
                            </td>
                            <td className="py-2 pr-3">{formatMoney(p.price)}</td>
                            <td className="py-2 pr-3">
                              {formatMoney(p.action_price)}
                            </td>
                            <td className="py-2">{formatNumber(p.stock)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {products.length > 50 ? (
                      <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                        Показаны первые 50 из {products.length}.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : action.is_participating ? (
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                Товары ещё не подтянулись — обновите данные из Ozon.
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
