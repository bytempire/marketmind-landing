"use client";

import { Calendar } from "lucide-react";
import { useMemo, useState } from "react";

import { QueryState } from "@/components/query-state";
import SearchableDropdown from "@/components/smoothui/components/searchable-dropdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useAdminSubscriptions, useChangePlan } from "@/lib/hooks";
import type { PlanType } from "@/lib/types";

const PLANS: PlanType[] = ["commerce", "starter", "business", "pro"];
const PLAN_LABELS: Record<PlanType, string> = {
  commerce: "Базовый",
  starter: "Старт",
  business: "Бизнес",
  pro: "Про",
};
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

function monthsLabel(n: number): string {
  if (n === 1) return "1 месяц";
  if (n >= 2 && n <= 4) return `${n} месяца`;
  return `${n} месяцев`;
}

export default function AdminSubscriptionsPage() {
  const { data, isLoading, isError } = useAdminSubscriptions();
  const changePlan = useChangePlan();
  const [months, setMonths] = useState<number>(1);

  const monthItems = useMemo(
    () =>
      MONTHS.map((m) => ({
        id: m,
        label: monthsLabel(m),
        description: m === 12 ? "Максимальный срок" : undefined,
        icon: <Calendar className="h-4 w-4" />,
      })),
    [],
  );

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      isEmpty={data?.length === 0}
    >
      <div className="mb-4 flex max-w-xs flex-col gap-2">
        <SearchableDropdown
          emptyMessage="Срок не найден"
          items={monthItems}
          label="Срок выдачи"
          placeholder="Поиск срока…"
          value={months}
          onChange={(item) => setMonths(Number(item.id))}
        />
        <p className="text-xs text-[var(--muted-foreground)]">
          Для оплаты выберите срок. «Сброс» снимает оплату и ставит
          «Базовый» без периода.
        </p>
      </div>
      <Table>
        <THead>
          <TR>
            <TH>Email</TH>
            <TH>Тариф</TH>
            <TH>Статус</TH>
            <TH>Лимит</TH>
            <TH>Период лимита</TH>
            <TH>Оплачено до</TH>
            <TH>Выдать тариф</TH>
          </TR>
        </THead>
        <TBody>
          {data?.map((s) => (
            <TR key={s.id}>
              <TD>{s.user_email}</TD>
              <TD>
                <Badge>{PLAN_LABELS[s.plan] ?? s.plan}</Badge>
              </TD>
              <TD>
                <Badge
                  variant={s.status === "active" ? "success" : "secondary"}
                >
                  {s.status}
                </Badge>
              </TD>
              <TD>{s.monthly_limit}</TD>
              <TD>
                {new Date(s.current_period_end).toLocaleDateString("ru-RU")}
              </TD>
              <TD>
                {s.paid_until
                  ? new Date(s.paid_until).toLocaleDateString("ru-RU")
                  : "—"}
              </TD>
              <TD>
                <div className="flex flex-wrap gap-1">
                  {PLANS.map((p) => (
                    <Button
                      key={p}
                      size="sm"
                      variant="outline"
                      disabled={changePlan.isPending}
                      onClick={() =>
                        changePlan.mutate({
                          userId: s.user_id,
                          plan: p,
                          months,
                        })
                      }
                    >
                      {PLAN_LABELS[p]} · {months}м
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={changePlan.isPending}
                    onClick={() =>
                      changePlan.mutate({
                        userId: s.user_id,
                        plan: "commerce",
                      })
                    }
                  >
                    Сброс
                  </Button>
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </QueryState>
  );
}
