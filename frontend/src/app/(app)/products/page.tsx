"use client";

import { PageHeader, QueryState } from "@/components/query-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { useHealth, useMarketplaces, useProducts } from "@/lib/hooks";

function scoreVariant(score: number): "success" | "warning" | "destructive" {
  if (score >= 70) return "success";
  if (score >= 40) return "warning";
  return "destructive";
}

export default function ProductsPage() {
  const products = useProducts();
  const health = useHealth();
  const { data: marketplaces } = useMarketplaces();

  const healthByProduct = new Map(
    (health.data ?? []).map((h) => [h.product_id, h]),
  );
  const ozonPartial =
    marketplaces?.some(
      (m) => m.type === "ozon" && m.last_sync_status === "partial",
    ) ?? false;

  const isLoading = products.isLoading || health.isLoading;
  const isError = products.isError;
  const items = products.data ?? [];

  return (
    <div>
      <PageHeader
        title="Товары"
        description="Каталог из кабинетов и индекс здоровья карточек"
      />
      {ozonPartial ? (
        <Notice>
          Товары синхронизированы. Отзывы и вопросы Ozon появятся после
          подписки Premium Pro — без них Health Score пока недоступен.
        </Notice>
      ) : null}
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={items.length === 0}
        emptyText="Товары появятся после синхронизации кабинета"
      >
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((p) => {
            const h = healthByProduct.get(p.id);
            return (
              <Card key={p.id}>
                <CardContent className="flex items-center justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {p.title ?? p.sku ?? p.external_id}
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {p.sku ? `SKU ${p.sku}` : `ID ${p.external_id}`}
                      {h
                        ? ` · Негатив ${h.negative} · Повторяемость ${h.repeatability}`
                        : " · Health Score после анализа отзывов"}
                    </div>
                  </div>
                  {h ? (
                    <Badge variant={scoreVariant(h.score)}>
                      {Math.round(h.score)}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">—</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </QueryState>
    </div>
  );
}
