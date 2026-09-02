"use client";

import { useState } from "react";

import { PageHeader, QueryState } from "@/components/query-state";
import { OzonSellerApiRolesHint } from "@/components/ozon-seller-api-roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { ApiError } from "@/lib/api";
import {
  useCreateMarketplace,
  useDeleteMarketplace,
  useMarketplaces,
  useSetPerformanceToken,
  useSyncMarketplace,
} from "@/lib/hooks";
import type { MarketplaceType } from "@/lib/types";

export default function MarketplacesPage() {
  const { data, isLoading, isError } = useMarketplaces();
  const create = useCreateMarketplace();
  const remove = useDeleteMarketplace();
  const sync = useSyncMarketplace();
  const setPerf = useSetPerformanceToken();

  const [type, setType] = useState<MarketplaceType>("wb");
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [clientId, setClientId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [perfClientId, setPerfClientId] = useState("");
  const [perfSecret, setPerfSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [perfFormId, setPerfFormId] = useState<string | null>(null);
  const [perfErr, setPerfErr] = useState<string | null>(null);

  const hasOzon = data?.some((m) => m.type === "ozon") ?? false;
  const ozonRepliesBlocked =
    data?.some((m) => m.type === "ozon" && !m.can_publish_replies) ?? false;

  const credentialsReady =
    type === "ozon"
      ? Boolean(clientId.trim() && apiKey.trim())
      : Boolean(token.trim());

  function submit() {
    setError(null);
    const api_token =
      type === "ozon"
        ? `${clientId.trim()}:${apiKey.trim()}`
        : token.trim();
    const performance_token =
      type === "ozon" && perfClientId.trim() && perfSecret.trim()
        ? `${perfClientId.trim()}:${perfSecret.trim()}`
        : undefined;
    create.mutate(
      {
        type,
        name: name.trim() || null,
        api_token,
        ...(performance_token ? { performance_token } : {}),
      },
      {
        onSuccess: () => {
          setName("");
          setToken("");
          setClientId("");
          setApiKey("");
          setPerfClientId("");
          setPerfSecret("");
        },
        onError: (e) =>
          setError(e instanceof ApiError ? e.message : "Ошибка подключения"),
      },
    );
  }

  function savePerformance(marketplaceId: string) {
    setPerfErr(null);
    if (!perfClientId.trim() || !perfSecret.trim()) {
      setPerfErr("Укажите client_id и client_secret Performance");
      return;
    }
    setPerf.mutate(
      {
        marketplaceId,
        performance_token: `${perfClientId.trim()}:${perfSecret.trim()}`,
      },
      {
        onSuccess: () => {
          setPerfFormId(null);
          setPerfClientId("");
          setPerfSecret("");
        },
        onError: (e) =>
          setPerfErr(
            e instanceof ApiError ? e.message : "Ошибка сохранения ключей",
          ),
      },
    );
  }

  return (
    <div>
      <PageHeader
        title="Кабинеты"
        description="Подключение Wildberries и Ozon"
      />

      {ozonRepliesBlocked ? (
        <Notice>
          Без подписки Ozon Premium Pro ответы на отзывы и вопросы через API
          недоступны. Пока доступны чтение товаров, коммерческая аналитика в
          «Коммерция → Продажи» и реклама в «Маркетинг → Реклама» (нужны ключи
          Performance API).
        </Notice>
      ) : hasOzon ? (
        <Notice variant="info">
          Для рекламной аналитики добавьте ключи Performance API
          (Настройки → API-ключи → Performance) — отдельно от Seller.
        </Notice>
      ) : null}

      <Card className={type === "ozon" ? "mb-6" : "mb-6 max-w-lg"}>
        <CardHeader>
          <CardTitle>Подключить кабинет</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-2">
            {(["wb", "ozon"] as const).map((t) => (
              <Button
                key={t}
                type="button"
                variant={type === t ? "default" : "outline"}
                size="sm"
                onClick={() => setType(t)}
              >
                {t === "wb" ? "Wildberries" : "Ozon"}
              </Button>
            ))}
          </div>
          <input
            className="h-10 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 text-sm"
            placeholder="Название (необязательно)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {type === "ozon" ? (
            <div className="grid items-start gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-3">
                <p className="text-xs text-[var(--muted-foreground)]">
                  Seller API
                </p>
                <input
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 text-sm"
                  placeholder="Client-Id"
                  autoComplete="off"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                />
                <input
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 text-sm"
                  placeholder="Api-Key"
                  type="password"
                  autoComplete="off"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-[var(--muted-foreground)]">
                  Performance API (реклама, необязательно)
                </p>
                <input
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 text-sm"
                  placeholder="Performance client_id"
                  autoComplete="off"
                  value={perfClientId}
                  onChange={(e) => setPerfClientId(e.target.value)}
                />
                <input
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 text-sm"
                  placeholder="Performance client_secret"
                  type="password"
                  autoComplete="off"
                  value={perfSecret}
                  onChange={(e) => setPerfSecret(e.target.value)}
                />
                <Button
                  disabled={!credentialsReady || create.isPending}
                  onClick={submit}
                >
                  {create.isPending ? "Проверка токена…" : "Подключить"}
                </Button>
                {error ? (
                  <p className="text-sm text-[var(--destructive)]">{error}</p>
                ) : null}
                {!hasOzon ? (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Для ИИ по отзывам и вопросам Ozon нужна подписка Premium Pro.
                  </p>
                ) : null}
              </div>
              <OzonSellerApiRolesHint
                variant="sidebar"
                className="md:border-l md:border-[var(--border)] md:pl-6"
              />
            </div>
          ) : (
            <>
              <input
                className="h-10 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 text-sm"
                placeholder="API-токен продавца"
                type="password"
                autoComplete="off"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <Button
                disabled={!credentialsReady || create.isPending}
                onClick={submit}
              >
                {create.isPending ? "Проверка токена…" : "Подключить"}
              </Button>
              {error ? (
                <p className="text-sm text-[var(--destructive)]">{error}</p>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={data?.length === 0}
        emptyText="Нет подключённых кабинетов"
      >
        <div className="flex flex-col gap-3">
          {data?.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {m.name ?? (m.type === "wb" ? "Wildberries" : "Ozon")}
                      <Badge variant="secondary">
                        {m.type === "wb" ? "WB" : "Ozon"}
                      </Badge>
                      {m.last_sync_status === "error" ? (
                        <Badge variant="destructive">ошибка синхр.</Badge>
                      ) : null}
                      {m.last_sync_status === "partial" ? (
                        <Badge variant="warning">частично</Badge>
                      ) : null}
                      {m.type === "ozon" && !m.can_publish_replies ? (
                        <Badge variant="warning">без ответов</Badge>
                      ) : null}
                      {m.type === "ozon" && m.has_performance_token ? (
                        <Badge variant="success">Performance</Badge>
                      ) : null}
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                      Seller •••{m.api_token_last4 ?? "····"}
                      {m.type === "ozon"
                        ? m.has_performance_token
                          ? ` · Performance •••${m.performance_token_last4 ?? "····"}`
                          : " · Performance не подключён"
                        : null}{" "}
                      · синхр.:{" "}
                      {m.last_sync
                        ? new Date(m.last_sync).toLocaleString("ru-RU")
                        : "—"}
                    </div>
                    {m.last_sync_error ? (
                      <p className="mt-2 max-w-xl text-xs text-[var(--destructive)]">
                        {m.last_sync_error}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.type === "ozon" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPerfFormId(
                            perfFormId === m.id ? null : m.id,
                          );
                          setPerfErr(null);
                          setPerfClientId("");
                          setPerfSecret("");
                        }}
                      >
                        {m.has_performance_token
                          ? "Обновить Performance"
                          : "Ключи Performance"}
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={sync.isPending}
                      onClick={() => sync.mutate(m.id)}
                    >
                      Синхронизировать
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(m.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
                {perfFormId === m.id ? (
                  <div className="flex max-w-md flex-col gap-2 rounded-lg border border-[var(--border)] p-3">
                    <input
                      className="h-9 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 text-sm"
                      placeholder="Performance client_id"
                      autoComplete="off"
                      value={perfClientId}
                      onChange={(e) => setPerfClientId(e.target.value)}
                    />
                    <input
                      className="h-9 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 text-sm"
                      placeholder="Performance client_secret"
                      type="password"
                      autoComplete="off"
                      value={perfSecret}
                      onChange={(e) => setPerfSecret(e.target.value)}
                    />
                    <Button
                      size="sm"
                      disabled={setPerf.isPending}
                      onClick={() => savePerformance(m.id)}
                    >
                      {setPerf.isPending ? "Проверка…" : "Сохранить"}
                    </Button>
                    {perfErr ? (
                      <p className="text-xs text-[var(--destructive)]">
                        {perfErr}
                      </p>
                    ) : null}
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
