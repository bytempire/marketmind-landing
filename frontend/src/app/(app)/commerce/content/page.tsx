"use client";

import { priceIndexVariant } from "@/components/commerce-ui";
import { PageHeader, QueryState } from "@/components/query-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { useOzonAutoSync } from "@/components/ozon-sync-controls";
import { useCommerceContent } from "@/lib/hooks";
import { useCabinet } from "@/lib/marketplace-cabinet";

export default function CommerceContentPage() {
  const { selected } = useCabinet();
  const isWbOnly = selected?.type === "wb";
  const content = useCommerceContent();
  useOzonAutoSync("commerce");

  return (
    <div>
      <PageHeader
        title="Контент"
        description="Рейтинг контента карточек и индекс цен Ozon"
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
              <CardTitle>Контент и цены</CardTitle>
            </CardHeader>
            <CardContent>
              <QueryState
                isLoading={content.isLoading}
                isError={content.isError}
                isEmpty={content.data?.length === 0}
                emptyText="Нет метрик контента. Синхронизация с Ozon идёт автоматически."
              >
                <ul className="flex flex-col gap-3">
                  {content.data?.slice(0, 20).map((item) => (
                    <li key={item.product_id} className="text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">
                          {item.title ?? item.sku ?? item.product_id}
                        </span>
                        <div className="flex shrink-0 items-center gap-2">
                          {item.content_rating != null ? (
                            <Badge
                              variant={
                                Number(item.content_rating) >= 80
                                  ? "success"
                                  : Number(item.content_rating) >= 60
                                    ? "warning"
                                    : "destructive"
                              }
                            >
                              контент {Math.round(Number(item.content_rating))}
                            </Badge>
                          ) : null}
                          {item.price_index_label || item.price_index ? (
                            <Badge
                              variant={priceIndexVariant(item.price_index)}
                            >
                              {item.price_index_label ?? item.price_index}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                      {item.improve_attributes &&
                      item.improve_attributes.length > 0 ? (
                        <p className="mt-1 text-[var(--muted-foreground)]">
                          Улучшить:{" "}
                          {item.improve_attributes
                            .map((a) => a.name)
                            .filter(Boolean)
                            .slice(0, 4)
                            .join(", ")}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </QueryState>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
