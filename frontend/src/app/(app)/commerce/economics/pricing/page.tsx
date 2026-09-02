"use client";

import { PricingTable } from "@/components/pricing-table";
import { QueryState } from "@/components/query-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePricing, useSavePricing } from "@/lib/hooks";
import { useCabinet } from "@/lib/marketplace-cabinet";

export default function PricingPage() {
  const { marketplaceId } = useCabinet();
  const pricing = usePricing();
  const save = useSavePricing();
  const items = pricing.data?.items ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Калькулятор цены и маржи</CardTitle>
      </CardHeader>
      <CardContent>
        {!marketplaceId ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Выберите кабинет Ozon, чтобы рассчитать цену и маржу по SKU.
          </p>
        ) : (
          <QueryState
            isLoading={pricing.isLoading}
            isError={pricing.isError}
            isEmpty={items.length === 0}
            emptyText="Нет карточек с ценой. Синхронизация с Ozon идёт автоматически."
          >
            {items.length ? (
              <PricingTable
                rows={items}
                disabled={!marketplaceId}
                onSave={(productId, inputs) =>
                  save.mutateAsync({ productId, inputs })
                }
              />
            ) : null}
          </QueryState>
        )}
      </CardContent>
    </Card>
  );
}
