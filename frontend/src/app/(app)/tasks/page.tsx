"use client";

import { useState } from "react";

import { PageHeader, QueryState } from "@/components/query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { ApiError } from "@/lib/api";
import {
  useAddTaskComment,
  useCreateTask,
  useOrganization,
  useTaskComments,
  useTasks,
  useUpdateTask,
} from "@/lib/hooks";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";

const STATUS_LABELS: Record<TaskStatus, string> = {
  open: "Открыта",
  in_progress: "В работе",
  done: "Готово",
  cancelled: "Отменена",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
  urgent: "Срочно",
};

const STATUSES: TaskStatus[] = ["open", "in_progress", "done", "cancelled"];
const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

function TaskCard({
  task,
  members,
}: {
  task: Task;
  members: { user_id: string; name: string | null; email: string }[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState("");
  const update = useUpdateTask();
  const { data: comments } = useTaskComments(expanded ? task.id : null);
  const addComment = useAddTaskComment(task.id);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-base">{task.title}</CardTitle>
          {task.description && (
            <p className="text-sm text-[var(--muted-foreground)]">
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary">{STATUS_LABELS[task.status]}</Badge>
            <Badge>{PRIORITY_LABELS[task.priority]}</Badge>
            {task.assignee_email && (
              <Badge variant="secondary">{task.assignee_email}</Badge>
            )}
            {task.comment_count > 0 && (
              <Badge variant="secondary">{task.comment_count} комм.</Badge>
            )}
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Скрыть" : "Обсуждение"}
        </Button>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4 border-t border-[var(--border)] pt-4">
          <div className="flex flex-wrap gap-2">
            <select
                value={task.status}
                onChange={(e) =>
                  update.mutate({
                    taskId: task.id,
                    status: e.target.value as TaskStatus,
                  })
                }
                className="h-8 rounded-lg border border-[var(--border)] bg-transparent px-2 text-xs"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              <select
                value={task.priority}
                onChange={(e) =>
                  update.mutate({
                    taskId: task.id,
                    priority: e.target.value as TaskPriority,
                  })
                }
                className="h-8 rounded-lg border border-[var(--border)] bg-transparent px-2 text-xs"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                ))}
              </select>
              <select
                value={task.assignee_id ?? ""}
                onChange={(e) =>
                  update.mutate({
                    taskId: task.id,
                    assignee_id: e.target.value || null,
                  })
                }
                className="h-8 rounded-lg border border-[var(--border)] bg-transparent px-2 text-xs"
              >
                <option value="">Без исполнителя</option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.name ?? m.email}
                  </option>
                ))}
              </select>
            </div>

          <div className="space-y-2">
            {comments?.map((c) => (
              <div
                key={c.id}
                className="rounded-lg bg-[var(--muted)] px-3 py-2 text-sm"
              >
                <div className="text-xs text-[var(--muted-foreground)]">
                  {c.user_name ?? c.user_email ?? "—"} ·{" "}
                  {new Date(c.created_at).toLocaleString("ru-RU")}
                </div>
                <div>{c.body}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Комментарий..."
              className="h-9 flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 text-sm"
            />
            <Button
              size="sm"
              disabled={!comment.trim() || addComment.isPending}
              onClick={() => {
                addComment.mutate(comment.trim(), {
                  onSuccess: () => setComment(""),
                });
              }}
            >
              Отправить
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function TasksPage() {
  const { data: org } = useOrganization();
  const { data, isLoading, isError } = useTasks();
  const create = useCreateTask();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    create.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        assignee_id: assigneeId || undefined,
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setAssigneeId("");
        },
        onError: (e) =>
          setError(e instanceof ApiError ? e.message : "Ошибка создания"),
      },
    );
  }

  return (
    <div>
      <PageHeader
        title="Задачи"
        description="Проблемы, назначения и обсуждение в одном месте"
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Новая задача</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {error && <Notice>{error}</Notice>}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Что нужно сделать"
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 text-sm"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Детали (опционально)"
              rows={2}
              className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as TaskPriority)
                }
                className="h-10 rounded-lg border border-[var(--border)] bg-transparent px-3 text-sm"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                ))}
              </select>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="h-10 rounded-lg border border-[var(--border)] bg-transparent px-3 text-sm"
              >
                <option value="">Исполнитель</option>
                {org?.members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.name ?? m.email}
                  </option>
                ))}
              </select>
              <Button
                onClick={submit}
                disabled={!title.trim() || create.isPending}
              >
                Создать
              </Button>
            </div>
          </CardContent>
      </Card>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={data?.length === 0}
        emptyText="Задач пока нет"
      >
        <div className="space-y-3">
          {data?.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              members={org?.members ?? []}
            />
          ))}
        </div>
      </QueryState>
    </div>
  );
}
