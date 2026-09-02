"use client";

import { NotificationsCard } from "@/components/notifications-card";
import { PageHeader, QueryState } from "@/components/query-state";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentUser } from "@/lib/hooks";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-[var(--border)] py-3 text-sm last:border-0">
      <span className="text-[var(--muted-foreground)]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function SettingsPage() {
  const { data, isLoading, isError } = useCurrentUser();

  return (
    <div>
      <PageHeader title="Настройки" description="Профиль и параметры аккаунта" />
      <div className="flex flex-col gap-6">
        <QueryState isLoading={isLoading} isError={isError}>
          {data ? (
            <Card className="max-w-lg">
              <CardContent className="p-6">
                <Row label="Имя" value={data.name ?? "—"} />
                <Row label="Email" value={data.email} />
                <Row
                  label="Роль"
                  value={data.role === "admin" ? "Админ" : "Пользователь"}
                />
                <Row label="Часовой пояс" value={data.timezone} />
                <Row
                  label="Порог автопубликации"
                  value={`${data.auto_publish_threshold}%`}
                />
                <Row
                  label="AI-инсайты"
                  value={data.ai_insights_enabled ? "Включены" : "Выключены"}
                />
              </CardContent>
            </Card>
          ) : null}
        </QueryState>
        <NotificationsCard />
      </div>
    </div>
  );
}
