"use client";

import { DiscountTaskTable } from "@/components/marketing-discount-tasks";
import { MarketingSection, MarketingStat } from "@/components/marketing-ui";
import { PageHeader, QueryState } from "@/components/query-state";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { ApiError } from "@/lib/api";
import { useDiscountTaskDecide, useDiscountTasks } from "@/lib/hooks";
import { formatNumber, formatPct } from "@/lib/marketing-format";
import { useCabinet } from "@/lib/marketplace-cabinet";
import Link from "next/link";
import { useState } from "react";

export default function MarketingDiscountTasksPage() {
  const { selected, marketplaces } = useCabinet();
  const isWbOnly = selected?.type === "wb";
  const hasOzon = marketplaces.some((m) => m.type === "ozon");
  const tasks = useDiscountTasks();
  const decide = useDiscountTaskDecide();
  const [busyId, setBusyId] = useState<number | null>(null);

  const threshold = tasks.data?.threshold_percent ?? "6";
  const errorText =
    decide.error instanceof ApiError
      ? decide.error.message
      : decide.error instanceof Error
        ? decide.error.message
        : null;

  async function run(opts: {
    action: "approve" | "decline";
    bucket?: "lte" | "gt";
    ids?: number[];
    confirm?: string;
  }) {
    if (opts.confirm && !window.confirm(opts.confirm)) return;
    setBusyId(opts.ids?.[0] ?? null);
    try {
      await decide.mutateAsync({
        action: opts.action,
        bucket: opts.bucket,
        ids: opts.ids,
      });
    } catch (e) {
      console.error(
        e instanceof ApiError ? e.message : "Не удалось обработать заявки",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Заявки на скидки"
        description="Запросы покупателей Ozon: принять скидки до порога и отклонить остальные. Список обновляется раз в минуту."
      />

      {isWbOnly || !hasOzon ? (
        <Notice className="mb-4">
          {!hasOzon ? (
            <>
              Чтобы видеть заявки, подключите кабинет Ozon в{" "}
              <Link href="/marketplaces" className="underline">
                Кабинетах
              </Link>
              .
            </>
          ) : (
            <>
              Сейчас выбран Wildberries. Выберите кабинет Ozon слева — заявки
              подтянутся из Seller API.
            </>
          )}
        </Notice>
      ) : null}

      {errorText ? <Notice className="mb-4">{errorText}</Notice> : null}

      {decide.isSuccess ? (
        <Notice className="mb-4" variant="info">
          Обработано: {decide.data.success_count}
          {decide.data.fail_count
            ? `, ошибок: ${decide.data.fail_count}`
            : ""}
          {decide.data.failures.length
            ? `. ${decide.data.failures.slice(0, 3).join("; ")}`
            : ""}
        </Notice>
      ) : null}

      {hasOzon && !isWbOnly ? (
        <QueryState isLoading={tasks.isLoading} isError={tasks.isError}>
          {tasks.data ? (
            <>
              <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
                <MarketingStat
                  label="Новых заявок"
                  value={formatNumber(tasks.data.pending)}
                  hint="Статусы NEW и SEEN из Ozon Seller API"
                />
                <MarketingStat
                  label={`До ${formatPct(threshold)}`}
                  value={formatNumber(tasks.data.lte_count)}
                  hint="Можно принять массово по запрошенной цене"
                />
                <MarketingStat
                  label={`Выше ${formatPct(threshold)}`}
                  value={formatNumber(tasks.data.gt_count)}
                  hint="Кандидаты на отклонение"
                />
              </div>

              <MarketingSection
                title={`До ${formatPct(threshold)}`}
                why="Небольшая скидка — обычно безопасно принять все сразу."
              >
                <div className="mb-4">
                  <Button
                    type="button"
                    size="sm"
                    disabled={
                      decide.isPending || tasks.data.lte_count === 0
                    }
                    onClick={() =>
                      void run({
                        action: "approve",
                        bucket: "lte",
                        confirm: `Принять все ${tasks.data.lte_count} заявок со скидкой до ${formatPct(threshold)}?`,
                      })
                    }
                  >
                    Принять все до {formatPct(threshold)}
                  </Button>
                </div>
                <QueryState
                  isLoading={false}
                  isError={false}
                  isEmpty={tasks.data.lte_count === 0}
                  emptyText="Нет заявок в этом диапазоне."
                >
                  <DiscountTaskTable
                    items={tasks.data.lte_threshold}
                    tone="success"
                    busyId={busyId}
                    onApprove={(id) =>
                      void run({ action: "approve", ids: [id] })
                    }
                    onDecline={(id) =>
                      void run({ action: "decline", ids: [id] })
                    }
                  />
                </QueryState>
              </MarketingSection>

              <MarketingSection
                title={`Выше ${formatPct(threshold)}`}
                why="Большая скидка — смотрите вручную или отклоните пакетом."
              >
                <div className="mb-4">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={
                      decide.isPending || tasks.data.gt_count === 0
                    }
                    onClick={() =>
                      void run({
                        action: "decline",
                        bucket: "gt",
                        confirm: `Отклонить все ${tasks.data.gt_count} заявок со скидкой выше ${formatPct(threshold)}?`,
                      })
                    }
                  >
                    Отклонить все выше {formatPct(threshold)}
                  </Button>
                </div>
                <QueryState
                  isLoading={false}
                  isError={false}
                  isEmpty={tasks.data.gt_count === 0}
                  emptyText="Нет заявок в этом диапазоне."
                >
                  <DiscountTaskTable
                    items={tasks.data.gt_threshold}
                    tone="destructive"
                    busyId={busyId}
                    onApprove={(id) =>
                      void run({ action: "approve", ids: [id] })
                    }
                    onDecline={(id) =>
                      void run({ action: "decline", ids: [id] })
                    }
                  />
                </QueryState>
              </MarketingSection>
            </>
          ) : null}
        </QueryState>
      ) : null}
    </div>
  );
}
