"use client";

import { useState } from "react";

import { QueryState } from "@/components/query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import {
  useNotificationSettings,
  useTelegramLink,
  useTelegramUnlink,
  useUpdateNotifications,
} from "@/lib/hooks";

function Toggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between py-2 text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        className="h-4 w-4 accent-[var(--primary)]"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

export function NotificationsCard() {
  const { data, isLoading, isError } = useNotificationSettings();
  const update = useUpdateNotifications();
  const link = useTelegramLink();
  const unlink = useTelegramUnlink();
  const [error, setError] = useState<string | null>(null);

  function setFlag(patch: {
    notify_negative?: boolean;
    notify_limit?: boolean;
    notify_commerce?: boolean;
  }) {
    if (!data) return;
    update.mutate({
      notify_negative: patch.notify_negative ?? data.notify_negative,
      notify_limit: patch.notify_limit ?? data.notify_limit,
      notify_commerce: patch.notify_commerce ?? data.notify_commerce,
    });
  }

  function connect() {
    setError(null);
    link.mutate(undefined, {
      onSuccess: (res) => window.open(res.deep_link, "_blank"),
      onError: (e) =>
        setError(
          e instanceof ApiError
            ? e.message
            : "Не удалось создать ссылку привязки",
        ),
    });
  }

  return (
    <Card className="max-w-lg">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Уведомления Telegram</CardTitle>
        {data?.telegram_linked ? (
          <Badge variant="success">подключён</Badge>
        ) : (
          <Badge variant="secondary">не подключён</Badge>
        )}
      </CardHeader>
      <CardContent>
        <QueryState isLoading={isLoading} isError={isError}>
          {data ? (
            <div className="flex flex-col gap-3">
              <div className="border-b border-[var(--border)] pb-3">
                {data.telegram_linked ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={unlink.isPending}
                    onClick={() => unlink.mutate()}
                  >
                    Отвязать Telegram
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      disabled={link.isPending}
                      onClick={connect}
                    >
                      {link.isPending ? "Создание ссылки…" : "Подключить Telegram"}
                    </Button>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Откроется бот — нажмите «Start», чтобы привязать аккаунт.
                    </p>
                    {error ? (
                      <p className="text-xs text-[var(--destructive)]">{error}</p>
                    ) : null}
                  </div>
                )}
              </div>
              <Toggle
                label="Негативные отзывы"
                checked={data.notify_negative}
                disabled={update.isPending}
                onChange={(v) => setFlag({ notify_negative: v })}
              />
              <Toggle
                label="Исчерпание лимита тарифа"
                checked={data.notify_limit}
                disabled={update.isPending}
                onChange={(v) => setFlag({ notify_limit: v })}
              />
              <Toggle
                label="Коммерция: остатки, падение продаж, контент"
                checked={data.notify_commerce}
                disabled={update.isPending}
                onChange={(v) => setFlag({ notify_commerce: v })}
              />
            </div>
          ) : null}
        </QueryState>
      </CardContent>
    </Card>
  );
}
