"use client";

import { useState } from "react";

import { PageHeader, QueryState } from "@/components/query-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useMarketplaces,
  useReplyReview,
  useReviews,
} from "@/lib/hooks";

export default function ReviewsPage() {
  const { data, isLoading, isError } = useReviews();
  const { data: marketplaces } = useMarketplaces();
  const reply = useReplyReview();
  const [openId, setOpenId] = useState<string | null>(null);
  const [text, setText] = useState("");

  const ozonRepliesBlocked =
    marketplaces?.some((m) => m.type === "ozon" && !m.can_publish_replies) ??
    false;
  const canReply =
    marketplaces?.some((m) => m.can_publish_replies) ?? false;

  function submit(id: string) {
    reply.mutate(
      { id, text },
      {
        onSuccess: () => {
          setOpenId(null);
          setText("");
        },
      },
    );
  }

  return (
    <div>
      <PageHeader title="Отзывы" description="Отзывы покупателей и анализ" />
      {ozonRepliesBlocked ? (
        <Notice>
          Без Ozon Premium Pro ответы на отзывы через API недоступны. Сейчас
          доступны чтение и AI-анализ при наличии данных.
        </Notice>
      ) : null}
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={data?.length === 0}
        emptyText="Отзывов пока нет. Для Ozon нужна подписка Premium Pro и синхронизация кабинета"
      >
        <div className="flex flex-col gap-3">
          {data?.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">
                      {r.author_name ?? "Аноним"}
                    </span>
                    {r.rating ? (
                      <span className="text-amber-500">
                        {"★".repeat(r.rating)}
                      </span>
                    ) : null}
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-sm">{r.text ?? "—"}</p>
                {canReply ? (
                  <div className="mt-3">
                    {openId === r.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          className="min-h-20 w-full rounded-lg border border-[var(--border)] bg-transparent p-2 text-sm"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder="Ваш ответ…"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={!text.trim() || reply.isPending}
                            onClick={() => submit(r.id)}
                          >
                            Отправить
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setOpenId(null)}
                          >
                            Отмена
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setOpenId(r.id);
                          setText("");
                        }}
                      >
                        Ответить
                      </Button>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}
