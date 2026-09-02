"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatMoney,
  formatNumber,
  formatPct,
  formatRemaining,
} from "@/lib/marketing-format";
import type { DiscountTaskItem } from "@/lib/types";

function qtyLabel(item: DiscountTaskItem): string {
  const min = item.requested_quantity_min;
  const max = item.requested_quantity_max;
  if (min == null && max == null) return "—";
  if (min != null && max != null && min !== max) {
    return `${formatNumber(min)}–${formatNumber(max)}`;
  }
  return formatNumber(min ?? max);
}

export function DiscountTaskTable({
  items,
  tone,
  onApprove,
  onDecline,
  busyId,
}: {
  items: DiscountTaskItem[];
  tone: "success" | "destructive";
  onApprove: (id: number) => void;
  onDecline: (id: number) => void;
  busyId: number | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
            <th className="pb-2 pr-4 font-medium">Товар</th>
            <th className="pb-2 pr-4 font-medium">Цена</th>
            <th className="pb-2 pr-4 font-medium">Запрос</th>
            <th className="pb-2 pr-4 font-medium">Скидка</th>
            <th className="pb-2 pr-4 font-medium">Кол-во</th>
            <th className="pb-2 pr-4 font-medium">До</th>
            <th className="pb-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-[var(--border)]/60 align-top"
            >
              <td className="py-3 pr-4">
                <div className="font-medium">
                  {item.title ?? item.offer_id ?? `SKU ${item.sku ?? item.id}`}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  {item.sku ? `SKU ${item.sku}` : null}
                  {item.customer_name ? ` · ${item.customer_name}` : null}
                </div>
                {item.user_comment ? (
                  <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {item.user_comment}
                  </div>
                ) : null}
              </td>
              <td className="py-3 pr-4">{formatMoney(item.original_price)}</td>
              <td className="py-3 pr-4">{formatMoney(item.requested_price)}</td>
              <td className="py-3 pr-4">
                <Badge variant={tone}>{formatPct(item.discount_percent)}</Badge>
              </td>
              <td className="py-3 pr-4">{qtyLabel(item)}</td>
              <td className="py-3 pr-4 text-xs text-[var(--muted-foreground)]">
                {formatRemaining(
                  item.remaining_seconds,
                  item.edited_till ?? item.end_at,
                )}
              </td>
              <td className="py-3">
                <div className="flex flex-wrap justify-end gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busyId === item.id}
                    onClick={() => onApprove(item.id)}
                  >
                    Принять
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={busyId === item.id}
                    onClick={() => onDecline(item.id)}
                  >
                    Отклонить
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
