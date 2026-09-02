"use client";

import Link from "next/link";

import { QueryState } from "@/components/query-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCommerceBriefing } from "@/lib/hooks";
import type { BriefingItem } from "@/lib/types";

const KIND_LABEL: Record<string, string> = {
  oos: "Остатки",
  expiration: "Срок годности",
  sales_drop: "Продажи",
  content: "Контент",
  price: "Цены",
};

const KIND_VARIANT: Record<
  string,
  "destructive" | "warning" | "secondary" | "success"
> = {
  oos: "destructive",
  expiration: "warning",
  sales_drop: "warning",
  content: "secondary",
  price: "warning",
};

function Item({ item }: { item: BriefingItem }) {
  return (
    <li className="rounded-lg border border-[var(--border)] p-3">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Badge variant={KIND_VARIANT[item.kind] ?? "secondary"}>
          {KIND_LABEL[item.kind] ?? item.kind}
        </Badge>
        <span className="text-sm font-medium">{item.title}</span>
      </div>
      <p className="text-sm text-[var(--muted-foreground)]">{item.detail}</p>
      <p className="mt-1 text-sm">→ {item.action}</p>
    </li>
  );
}

export function BriefingCard({
  title = "Что сделать сегодня",
  showLink = true,
}: {
  title?: string;
  showLink?: boolean;
}) {
  const briefing = useCommerceBriefing();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle>{title}</CardTitle>
        {showLink ? (
          <Link
            href="/commerce/sales"
            className="text-sm text-[var(--muted-foreground)] underline-offset-2 hover:underline"
          >
            Коммерция
          </Link>
        ) : null}
      </CardHeader>
      <CardContent>
        <QueryState
          isLoading={briefing.isLoading}
          isError={briefing.isError}
          isEmpty={briefing.data?.items.length === 0}
          emptyText="Срочных действий нет — кабинет в порядке по доступным данным."
        >
          <ul className="flex flex-col gap-3">
            {briefing.data?.items.map((item) => (
              <Item
                key={`${item.kind}-${item.sku ?? item.title}-${item.priority}`}
                item={item}
              />
            ))}
          </ul>
          {briefing.data && briefing.data.total_candidates > briefing.data.items.length ? (
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Показаны топ-{briefing.data.items.length} из{" "}
              {briefing.data.total_candidates} сигналов.
            </p>
          ) : null}
        </QueryState>
      </CardContent>
    </Card>
  );
}
