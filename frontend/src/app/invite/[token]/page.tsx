"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { YandexLoginButton } from "@/components/landing/yandex-login-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { ApiError } from "@/lib/api";
import {
  useAcceptInvite,
  useCurrentUser,
  useInvitePreview,
} from "@/lib/hooks";

export default function InvitePage() {
  const params = useParams();
  const token = typeof params.token === "string" ? params.token : "";
  const { data: preview, isLoading, isError } = useInvitePreview(token);
  const { data: user } = useCurrentUser();
  const accept = useAcceptInvite();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || preview?.status !== "pending" || !token) return;
    accept.mutate(token, {
      onSuccess: () => {
        window.location.href = "/dashboard";
      },
      onError: (e) =>
        setError(e instanceof ApiError ? e.message : "Не удалось принять"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- auto-accept once when logged in
  }, [user?.id, preview?.status, token]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="text-sm text-[var(--muted-foreground)]">Загрузка…</p>
      </div>
    );
  }

  if (isError || !preview) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Notice>Инвайт не найден или недействен</Notice>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Инвайт в команду</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Кабинет: <strong>{preview.organization_name}</strong>
          </p>
          <p>
            Email: <strong>{preview.email}</strong>
          </p>
          {preview.status !== "pending" && (
            <Notice>Инвайт уже использован или отозван</Notice>
          )}
          {error && <Notice>{error}</Notice>}
          {!user && preview.status === "pending" && (
            <div>
              <p className="mb-3 text-sm text-[var(--muted-foreground)]">
                Войдите через Yandex с email{" "}
                <strong>{preview.email}</strong>
              </p>
              <YandexLoginButton />
            </div>
          )}
          {user && accept.isPending && (
            <p className="text-sm">Принимаем инвайт…</p>
          )}
          {user && preview.status === "pending" && !accept.isPending && (
            <Button onClick={() => accept.mutate(token)}>Принять инвайт</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
