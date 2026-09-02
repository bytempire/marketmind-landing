"use client";

import { useState } from "react";

import { CreateTaskButton } from "@/components/create-task-button";
import { PageHeader, QueryState } from "@/components/query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { ApiError } from "@/lib/api";
import {
  useGenerateInsights,
  useInsights,
  useInsightsSettings,
  useUpdateInsightsSettings,
} from "@/lib/hooks";
import type { Insight } from "@/lib/types";
import { taskPayloadFromInsight } from "@/lib/task-from-source";

const TYPE_LABELS: Record<string, string> = {
  recommendation: "Действие",
  rating_cause: "Рейтинг",
  risk: "Риск",
  seo: "Карточка",
};

const TYPE_VARIANTS: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  recommendation: "success",
  rating_cause: "warning",
  risk: "destructive",
  seo: "default",
};

function insightRank(item: Insight): number {
  return item.priority ?? 0;
}

function ManagerCard({ item }: { item: Insight }) {
  const hasStructure = Boolean(item.problem && item.action);
  const isCritical = (item.priority ?? 0) >= 85;
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <CardTitle className="text-base leading-snug">{item.title}</CardTitle>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          {isCritical ? <Badge variant="destructive">Важно</Badge> : null}
          <Badge variant={TYPE_VARIANTS[item.type] ?? "secondary"}>
            {TYPE_LABELS[item.type] ?? item.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="mt-auto space-y-3 text-sm">
        {hasStructure ? (
          <>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                Проблема
              </p>
              <p>{item.problem}</p>
            </div>
            {item.impact ? (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                  Почему важно
                </p>
                <p className="text-[var(--muted-foreground)]">{item.impact}</p>
              </div>
            ) : null}
            <div className="rounded-md border border-[var(--border)] bg-[var(--muted)]/30 p-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                Что сделать
              </p>
              <p className="font-medium">{item.action}</p>
            </div>
          </>
        ) : (
          <p className="text-[var(--muted-foreground)]">{item.body}</p>
        )}
        <CreateTaskButton draft={taskPayloadFromInsight(item)} />
      </CardContent>
    </Card>
  );
}

export default function InsightsPage() {
  const { data, isLoading, isError } = useInsights();
  const settings = useInsightsSettings();
  const updateSettings = useUpdateInsightsSettings();
  const generate = useGenerateInsights();
  const [notice, setNotice] = useState<string | null>(null);

  const available = settings.data?.available ?? false;
  const enabled = settings.data?.enabled ?? false;
  const canGenerate = available && enabled;

  function toggle(next: boolean) {
    setNotice(null);
    updateSettings.mutate(next, {
      onError: (e) =>
        setNotice(
          e instanceof ApiError
            ? e.message
            : "Не удалось сохранить настройку",
        ),
    });
  }

  function run() {
    setNotice(null);
    generate.mutate(undefined, {
      onSuccess: (result) => {
        setNotice(result.message);
      },
      onError: (e) =>
        setNotice(
          e instanceof ApiError
            ? e.message
            : "Не удалось запустить генерацию",
        ),
    });
  }

  return (
    <div>
      <PageHeader
        title="AI-менеджер"
        description="Где проблема, почему это бьёт по деньгам и что сделать"
      />

      {settings.data && !available ? (
        <Notice variant="info">
          AI-менеджер доступен на тарифе «Старт» и выше. Перейдите в раздел
          «Тариф», чтобы сменить план.
        </Notice>
      ) : null}

      {available ? (
        <Card className="mb-4 max-w-lg">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-medium">AI-менеджер</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Включайте перед генерацией новых советов
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <span>{enabled ? "Вкл" : "Выкл"}</span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={enabled}
                disabled={updateSettings.isPending}
                onChange={(e) => toggle(e.target.checked)}
              />
            </label>
          </CardContent>
        </Card>
      ) : null}

      <div className="mb-4 flex items-center gap-3">
        <Button
          disabled={!canGenerate || generate.isPending}
          onClick={run}
        >
          {generate.isPending ? "Думаю…" : "Спросить менеджера"}
        </Button>
        {notice ? (
          <span className="text-sm text-[var(--muted-foreground)]">{notice}</span>
        ) : null}
      </div>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={data?.length === 0}
        emptyText="Пока пусто — включите AI-менеджера и нажмите «Спросить менеджера»"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[...(data ?? [])]
            .sort((a, b) => insightRank(b) - insightRank(a))
            .map((i) => (
              <ManagerCard key={i.id} item={i} />
            ))}
        </div>
      </QueryState>
    </div>
  );
}
