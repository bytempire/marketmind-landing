"use client";

import { QueryState } from "@/components/query-state";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminStats } from "@/lib/hooks";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-sm text-[var(--muted-foreground)]">{label}</div>
        <div className="mt-2 text-2xl font-semibold">{value}</div>
        {hint ? (
          <div className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function AdminOverviewPage() {
  const { data, isLoading, isError } = useAdminStats();

  return (
    <QueryState isLoading={isLoading} isError={isError}>
      {data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            label="MRR"
            value={`${data.mrr_rub.toLocaleString("ru-RU")} ₽`}
            hint={`${data.paid_subscriptions} платных подписок`}
          />
          <Stat label="Churn" value={`${(data.churn_rate * 100).toFixed(1)}%`} />
          <Stat label="Пользователи" value={data.users_total} />
          <Stat
            label="Активные подписки"
            value={data.active_subscriptions}
          />
          <Stat
            label="OpenRouter, месяц"
            value={`$${data.openrouter_month_usd.toFixed(2)}`}
            hint={`всего $${data.openrouter_total_usd.toFixed(2)}`}
          />
          <Stat label="Ошибки ответов" value={data.failed_answers} />
          <Stat label="Ошибки синхр." value={data.sync_errors} />
        </div>
      ) : null}
    </QueryState>
  );
}
