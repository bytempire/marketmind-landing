"use client";

import { useState } from "react";

import { PageHeader, QueryState } from "@/components/query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { ApiError } from "@/lib/api";
import {
  useCreateInvite,
  useOrganization,
  useRemoveMember,
  useRevokeInvite,
} from "@/lib/hooks";

function memberLabel(role: string): string {
  return role === "owner" ? "Владелец" : "Участник";
}

export default function TeamPage() {
  const { data, isLoading, isError } = useOrganization();
  const createInvite = useCreateInvite();
  const revokeInvite = useRevokeInvite();
  const removeMember = useRemoveMember();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function submitInvite() {
    setError(null);
    createInvite.mutate(email.trim(), {
      onSuccess: () => setEmail(""),
      onError: (e) =>
        setError(e instanceof ApiError ? e.message : "Не удалось отправить"),
    });
  }

  async function copyLink(url: string | null, id: string) {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div>
      <PageHeader
        title="Команда"
        description="Менеджеры с полным доступом к кабинету и задачам"
      />

      <QueryState isLoading={isLoading} isError={isError} isEmpty={false}>
        {data && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{data.organization.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[var(--muted-foreground)]">
                Вы:{" "}
                <Badge variant="secondary">
                  {memberLabel(data.my_role)}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Добавить менеджера</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {error && <Notice>{error}</Notice>}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    placeholder="email@company.ru"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 text-sm"
                  />
                  <Button
                    onClick={submitInvite}
                    disabled={!email.trim() || createInvite.isPending}
                  >
                    Создать ссылку
                  </Button>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Менеджер получит полный доступ. Войти — через Yandex с тем же
                  email.
                </p>
              </CardContent>
            </Card>

            {data.pending_invites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ожидают входа</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <THead>
                      <TR>
                        <TH>Email</TH>
                        <TH>Ссылка</TH>
                        <TH />
                      </TR>
                    </THead>
                    <TBody>
                      {data.pending_invites.map((inv) => (
                        <TR key={inv.id}>
                          <TD>{inv.email}</TD>
                          <TD>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                copyLink(inv.invite_url, inv.id)
                              }
                            >
                              {copiedId === inv.id ? "Скопировано" : "Копировать"}
                            </Button>
                          </TD>
                          <TD>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => revokeInvite.mutate(inv.id)}
                            >
                              Отозвать
                            </Button>
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Участники</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <THead>
                    <TR>
                      <TH>Email</TH>
                      <TH>Имя</TH>
                      <TH>Статус</TH>
                      <TH>В команде</TH>
                      <TH />
                    </TR>
                  </THead>
                  <TBody>
                    {data.members.map((m) => (
                      <TR key={m.id}>
                        <TD>{m.email}</TD>
                        <TD>{m.name ?? "—"}</TD>
                        <TD>{memberLabel(m.role)}</TD>
                        <TD>
                          {new Date(m.joined_at).toLocaleDateString("ru-RU")}
                        </TD>
                        <TD>
                          {m.role !== "owner" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeMember.mutate(m.user_id)}
                            >
                              Удалить
                            </Button>
                          )}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </QueryState>
    </div>
  );
}
