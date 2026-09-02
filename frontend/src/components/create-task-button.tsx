"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { ApiError } from "@/lib/api";
import { useCreateTask, useOrganization } from "@/lib/hooks";
import { useCabinet } from "@/lib/marketplace-cabinet";
import type { TaskPriority } from "@/lib/types";
import { cn } from "@/lib/utils";

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
  urgent: "Срочно",
};

type TaskDraft = {
  title: string;
  description?: string;
  priority: TaskPriority;
  source_type: "insight" | "oos" | "commerce_alert" | "manual";
  source_ref?: Record<string, unknown>;
  marketplace_id?: string;
};

export function CreateTaskButton({
  draft,
  className,
  size = "sm",
}: {
  draft: TaskDraft;
  className?: string;
  size?: "sm" | "default";
}) {
  const { data: org } = useOrganization();
  const { marketplaceId } = useCabinet();
  const create = useCreateTask();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(draft.title);
  const [priority, setPriority] = useState(draft.priority);
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  function resetForm() {
    setTitle(draft.title);
    setPriority(draft.priority);
    setAssigneeId("");
    setError(null);
    setCreatedId(null);
  }

  function submit() {
    setError(null);
    create.mutate(
      {
        title: title.trim(),
        description: draft.description,
        priority,
        assignee_id: assigneeId || undefined,
        source_type: draft.source_type,
        source_ref: draft.source_ref,
        marketplace_id: draft.marketplace_id ?? marketplaceId ?? undefined,
      },
      {
        onSuccess: (task) => {
          setCreatedId(task.id);
        },
        onError: (e) =>
          setError(e instanceof ApiError ? e.message : "Не удалось создать"),
      },
    );
  }

  return (
    <div className={cn("relative", className)}>
      {!open ? (
        <Button
          type="button"
          size={size}
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            resetForm();
            setOpen(true);
          }}
        >
          Создать задачу
        </Button>
      ) : (
        <div
          className="mt-2 space-y-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
          onClick={(e) => e.stopPropagation()}
        >
          {createdId ? (
            <div className="space-y-2 text-sm">
              <p className="text-[var(--muted-foreground)]">Задача создана</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/tasks">
                  <Button size="sm">Открыть задачи</Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                >
                  Закрыть
                </Button>
              </div>
            </div>
          ) : (
            <>
              {error ? <Notice>{error}</Notice> : null}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as TaskPriority)
                  }
                  className="h-8 rounded-lg border border-[var(--border)] bg-transparent px-2 text-xs"
                >
                  {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((p) => (
                    <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                  ))}
                </select>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="h-8 rounded-lg border border-[var(--border)] bg-transparent px-2 text-xs"
                >
                  <option value="">Исполнитель</option>
                  {org?.members.map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.name ?? m.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={!title.trim() || create.isPending}
                  onClick={submit}
                >
                  {create.isPending ? "Создаём…" : "Назначить"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                >
                  Отмена
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
