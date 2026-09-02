"use client";

import { QueryState } from "@/components/query-state";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useAdminUsers } from "@/lib/hooks";

export default function AdminUsersPage() {
  const { data, isLoading, isError } = useAdminUsers();

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      isEmpty={data?.length === 0}
    >
      <Table>
        <THead>
          <TR>
            <TH>Email</TH>
            <TH>Имя</TH>
            <TH>Роль</TH>
            <TH>Тариф</TH>
            <TH>Статус</TH>
            <TH>Регистрация</TH>
          </TR>
        </THead>
        <TBody>
          {data?.map((u) => (
            <TR key={u.id}>
              <TD>{u.email}</TD>
              <TD>{u.name ?? "—"}</TD>
              <TD>
                {u.role === "admin" ? (
                  <Badge>admin</Badge>
                ) : (
                  <Badge variant="secondary">user</Badge>
                )}
              </TD>
              <TD>{u.plan ?? "—"}</TD>
              <TD>
                {u.is_active ? (
                  <Badge variant="success">активен</Badge>
                ) : (
                  <Badge variant="destructive">выключен</Badge>
                )}
              </TD>
              <TD>{new Date(u.created_at).toLocaleDateString("ru-RU")}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </QueryState>
  );
}
