"use client";

import { PageHeader, QueryState } from "@/components/query-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHealth, usePains } from "@/lib/hooks";

export default function AnalyticsPage() {
  const pains = usePains();
  const health = useHealth();

  const maxCount = Math.max(1, ...(pains.data?.map((p) => p.count) ?? [1]));

  return (
    <div>
      <PageHeader
        title="Аналитика"
        description="Карта болей и индекс здоровья товаров"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Карта болей</CardTitle>
          </CardHeader>
          <CardContent>
            <QueryState
              isLoading={pains.isLoading}
              isError={pains.isError}
              isEmpty={pains.data?.length === 0}
            >
              <ul className="flex flex-col gap-3">
                {pains.data?.map((p) => (
                  <li key={p.pain}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{p.label}</span>
                      <span className="font-medium">{p.count}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[var(--muted)]">
                      <div
                        className="h-2 rounded-full bg-[var(--primary)]"
                        style={{ width: `${(p.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </QueryState>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Индекс здоровья</CardTitle>
          </CardHeader>
          <CardContent>
            <QueryState
              isLoading={health.isLoading}
              isError={health.isError}
              isEmpty={health.data?.length === 0}
            >
              <ul className="flex flex-col gap-2">
                {health.data?.map((h) => (
                  <li
                    key={h.product_id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate pr-2">
                      {h.product_title ?? h.product_id}
                    </span>
                    <Badge
                      variant={
                        h.score >= 70
                          ? "success"
                          : h.score >= 40
                            ? "warning"
                            : "destructive"
                      }
                    >
                      {Math.round(h.score)}
                    </Badge>
                  </li>
                ))}
              </ul>
            </QueryState>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
