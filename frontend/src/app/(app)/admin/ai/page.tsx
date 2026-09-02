"use client";

import { QueryState } from "@/components/query-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useAdminOpenRouter } from "@/lib/hooks";
import { PLAN_LABELS } from "@/lib/plans";

function formatUsd(value: number): string {
  if (Math.abs(value) < 0.01 && value !== 0) {
    return `$${value.toFixed(4)}`;
  }
  return `$${value.toFixed(2)}`;
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
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

export default function AdminAiPage() {
  const { data, isLoading, isError } = useAdminOpenRouter();

  return (
    <QueryState isLoading={isLoading} isError={isError}>
      {data ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <Stat
              label="OpenRouter, месяц"
              value={formatUsd(data.current_month_usd)}
              hint={`${data.by_user.reduce((sum, row) => sum + row.requests_month, 0)} запросов`}
            />
            <Stat
              label="OpenRouter, всего"
              value={formatUsd(data.total_usd)}
              hint={`${data.by_user.reduce((sum, row) => sum + row.requests_total, 0)} запросов`}
            />
          </div>

          {data.by_user.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              Запросов к OpenRouter пока нет
            </p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Email</TH>
                  <TH>Тариф</TH>
                  <TH>Запросов (мес)</TH>
                  <TH>$ месяц</TH>
                  <TH>Запросов (всего)</TH>
                  <TH>$ всего</TH>
                </TR>
              </THead>
              <TBody>
                {data.by_user.map((row) => (
                  <TR key={row.user_id ?? row.email ?? "unknown"}>
                    <TD>{row.email ?? "—"}</TD>
                    <TD>
                      {row.plan ? (
                        <Badge>{PLAN_LABELS[row.plan] ?? row.plan}</Badge>
                      ) : (
                        "—"
                      )}
                    </TD>
                    <TD>{row.requests_month}</TD>
                    <TD>{formatUsd(row.cost_month_usd)}</TD>
                    <TD>{row.requests_total}</TD>
                    <TD>{formatUsd(row.cost_total_usd)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </div>
      ) : null}
    </QueryState>
  );
}
