"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { PageHeader, QueryState } from "@/components/query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { ApiError } from "@/lib/api";
import { useCheckout, useSubscription } from "@/lib/hooks";
import { PLANS, type PlanInfo } from "@/lib/plans";
import type { PlanType } from "@/lib/types";
import { cn } from "@/lib/utils";

const MONTH_OPTIONS = [1, 6, 12] as const;
type MonthOption = (typeof MONTH_OPTIONS)[number];
function monthsLabel(n: MonthOption): string {
  if (n === 1) return "1 месяц";
  if (n === 6) return "6 месяцев";
  return "12 месяцев";
}

function formatRub(amount: number): string {
  return `${amount.toLocaleString("ru-RU")} ₽`;
}

function PaidNotices({
  onRefresh,
}: {
  onRefresh: () => void;
}) {
  const searchParams = useSearchParams();
  const paidFlag = searchParams.get("paid");
  if (paidFlag === "1") {
    return (
      <Notice variant="info">
        Оплата прошла. Тариф активируется в течение минуты — обновите страницу,
        если статус ещё не изменился.{" "}
        <button type="button" className="underline" onClick={onRefresh}>
          Обновить
        </button>
      </Notice>
    );
  }
  if (paidFlag === "0") {
    return (
      <Notice>
        Оплата не завершена или отклонена. Можно попробовать снова ниже.
      </Notice>
    );
  }
  return null;
}

export default function BillingPage() {
  const { data, isLoading, isError, refetch } = useSubscription();
  const checkout = useCheckout();
  const [monthsByPlan, setMonthsByPlan] = useState<
    Partial<Record<PlanType, MonthOption>>
  >({});
  const [payError, setPayError] = useState<string | null>(null);
  const [payErrorPlan, setPayErrorPlan] = useState<PlanType | null>(null);
  const [payingPlan, setPayingPlan] = useState<PlanType | null>(null);

  const currentPlan = data
    ? (PLANS.find((p) => p.id === data.plan) ?? null)
    : null;
  const showAiUsage = Boolean(data && data.monthly_limit > 0);
  const isPaid = Boolean(
    data?.paid_until && new Date(data.paid_until).getTime() > Date.now(),
  );

  async function pay(plan: PlanInfo) {
    setPayError(null);
    setPayErrorPlan(plan.id);
    setPayingPlan(plan.id);
    try {
      const result = await checkout.mutateAsync({
        months: monthsByPlan[plan.id] ?? 1,
        plan: plan.id,
      });
      window.location.href = result.payment_url;
    } catch (err) {
      setPayingPlan(null);
      const message =
        err instanceof ApiError
          ? err.message
          : "Не удалось начать оплату. Попробуйте позже.";
      setPayError(message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Тариф"
        description="Планы MarketMind и текущее использование"
      />

      <Suspense fallback={null}>
        <PaidNotices onRefresh={() => void refetch()} />
      </Suspense>

      <Notice variant="info">
        На Ozon ИИ по отзывам и вопросам работает при подписке продавца{" "}
        <span className="font-medium text-[var(--foreground)]">Premium Pro</span>
        .
      </Notice>

      <QueryState isLoading={isLoading} isError={isError}>
        {data ? (
          <div className="flex flex-col gap-8">
            <Card className="max-w-lg">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>{currentPlan?.name ?? data.plan}</CardTitle>
                  <CardDescription className="mt-1">
                    {showAiUsage
                      ? "Текущий план и лимиты периода"
                      : "Текущий план"}
                  </CardDescription>
                </div>
                <Badge
                  variant={data.status === "active" ? "success" : "secondary"}
                >
                  {data.status}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {showAiUsage ? (
                  <>
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>Использовано AI-ответов</span>
                        <span className="font-medium">
                          {data.used} / {data.monthly_limit}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[var(--muted)]">
                        <div
                          className="h-2 rounded-full bg-[var(--primary)]"
                          style={{
                            width: `${Math.min(
                              100,
                              (data.used / Math.max(1, data.monthly_limit)) *
                                100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-[var(--muted-foreground)]">
                      Остаток: {data.remaining} · период до{" "}
                      {new Date(data.current_period_end).toLocaleDateString(
                        "ru-RU",
                      )}
                      {isPaid && data.paid_until
                        ? ` · оплачено до ${new Date(data.paid_until).toLocaleDateString("ru-RU")}`
                        : null}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-[var(--muted-foreground)]">
                    {currentPlan?.description}
                    {currentPlan ? " · " : null}
                    период до{" "}
                    {new Date(data.current_period_end).toLocaleDateString(
                      "ru-RU",
                    )}
                    {isPaid && data.paid_until
                      ? ` · оплачено до ${new Date(data.paid_until).toLocaleDateString("ru-RU")}`
                      : null}
                  </div>
                )}
              </CardContent>
            </Card>

            <section>
              <h2 className="mb-1 text-base font-semibold tracking-tight">
                Все тарифы
              </h2>
              <p className="mb-4 text-sm text-[var(--muted-foreground)]">
                «Базовый» — продажи и маркетинг без AI. «Старт» — AI-аналитика
                по коммерции. «Бизнес» и «Про» — плюс AI по отзывам и ответы.
                На Ozon для AI нужна подписка Premium Pro у продавца.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {PLANS.map((plan) => {
                  const isCurrent = data.plan === plan.id;
                  return (
                    <Card
                      key={plan.id}
                      className={cn(
                        isCurrent &&
                          "border-[var(--primary)] ring-1 ring-[var(--primary)]",
                      )}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle>{plan.name}</CardTitle>
                          {isCurrent ? (
                            <Badge variant="success">Текущий</Badge>
                          ) : null}
                        </div>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-3">
                        <div>
                          <p className="text-2xl font-semibold tracking-tight">
                            {plan.priceLabel}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            в месяц
                          </p>
                        </div>
                        <ul className="space-y-1 text-sm text-[var(--muted-foreground)]">
                          {plan.features.map((f) => (
                            <li key={f}>{f}</li>
                          ))}
                        </ul>
                        {plan.payable ? (
                          <PlanRenewal
                            plan={plan}
                            months={monthsByPlan[plan.id] ?? 1}
                            isCurrent={isCurrent}
                            isPaid={isPaid}
                            pending={checkout.isPending}
                            paying={payingPlan === plan.id}
                            error={payErrorPlan === plan.id ? payError : null}
                            onMonths={(m) =>
                              setMonthsByPlan((prev) => ({
                                ...prev,
                                [plan.id]: m,
                              }))
                            }
                            onPay={() => void pay(plan)}
                          />
                        ) : null}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          </div>
        ) : null}
      </QueryState>
    </div>
  );
}

function PlanRenewal({
  plan,
  months,
  isCurrent,
  isPaid,
  pending,
  paying,
  error,
  onMonths,
  onPay,
}: {
  plan: PlanInfo;
  months: MonthOption;
  isCurrent: boolean;
  isPaid: boolean;
  pending: boolean;
  paying: boolean;
  error: string | null;
  onMonths: (months: MonthOption) => void;
  onPay: () => void;
}) {
  const totalRub = plan.priceRub * months;
  const actionLabel = isCurrent && isPaid ? "Продлить" : "Оплатить";
  return (
    <div className="mt-1 flex flex-col gap-3 border-t border-[var(--border)] pt-3">
      <div className="flex flex-wrap gap-2">
        {MONTH_OPTIONS.map((m) => (
          <Button
            key={m}
            type="button"
            size="sm"
            variant={months === m ? "default" : "outline"}
            onClick={() => onMonths(m)}
          >
            {monthsLabel(m)}
          </Button>
        ))}
      </div>
      <div>
        <p className="text-sm font-medium">{formatRub(totalRub)}</p>
        <p className="text-xs text-[var(--muted-foreground)]">
          {formatRub(plan.priceRub)} × {months}{" "}
          {months === 1 ? "месяц" : "мес."}
        </p>
      </div>
      <Button disabled={pending} onClick={onPay}>
        {paying && pending ? "Создаём платёж…" : actionLabel}
      </Button>
      {error ? (
        <p className="text-sm text-[var(--destructive)]">{error}</p>
      ) : null}
    </div>
  );
}
