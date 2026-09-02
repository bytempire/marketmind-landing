"use client";

import { Package, ShoppingBag } from "lucide-react";
import { useMemo } from "react";

import SearchableDropdown from "@/components/smoothui/components/searchable-dropdown";
import {
  cabinetLabel,
  useCabinet,
} from "@/lib/marketplace-cabinet";
import { cn } from "@/lib/utils";

export function CabinetSelector({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { marketplaceId, setMarketplaceId, marketplaces, isLoading } =
    useCabinet();

  const items = useMemo(
    () =>
      marketplaces.map((m) => ({
        id: m.id,
        label: cabinetLabel(m),
        description:
          m.type === "wb"
            ? "Wildberries · отзывы и товары"
            : "Ozon · коммерция и контент",
        icon:
          m.type === "wb" ? (
            <ShoppingBag className="h-4 w-4" />
          ) : (
            <Package className="h-4 w-4" />
          ),
      })),
    [marketplaces],
  );

  if (isLoading) {
    return (
      <div
        className={cn(
          "h-9 w-full animate-pulse rounded-lg bg-[var(--muted)]",
          className,
        )}
      />
    );
  }

  if (marketplaces.length === 0) {
    return (
      <p className={cn("text-xs text-[var(--muted-foreground)]", className)}>
        Нет кабинетов
      </p>
    );
  }

  return (
    <div className={cn(compact ? "min-w-0 overflow-hidden" : "w-full", className)}>
      {!compact ? (
        <span className="mb-1 block text-xs text-[var(--muted-foreground)]">
          Кабинет
        </span>
      ) : null}
      <SearchableDropdown
        emptyMessage="Кабинеты не найдены"
        items={items}
        label="Выберите кабинет"
        placeholder="Поиск кабинета…"
        value={marketplaceId ?? items[0]?.id}
        onChange={(item) => setMarketplaceId(String(item.id))}
      />
    </div>
  );
}
