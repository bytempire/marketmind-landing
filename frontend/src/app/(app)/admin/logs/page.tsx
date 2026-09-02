"use client";

import { QueryState } from "@/components/query-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useAdminLogs } from "@/lib/hooks";

export default function AdminLogsPage() {
  const { data, isLoading, isError } = useAdminLogs();

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      isEmpty={data?.length === 0}
      emptyText="Логов пока нет"
    >
      <Table>
        <THead>
          <TR>
            <TH>Время</TH>
            <TH>Действие</TH>
            <TH>Сущность</TH>
            <TH>IP</TH>
          </TR>
        </THead>
        <TBody>
          {data?.map((l) => (
            <TR key={l.id}>
              <TD>{new Date(l.created_at).toLocaleString("ru-RU")}</TD>
              <TD className="font-medium">{l.action}</TD>
              <TD>
                {l.entity ?? "—"}
                {l.entity_id ? (
                  <span className="text-[var(--muted-foreground)]">
                    {" "}
                    ({l.entity_id.slice(0, 8)})
                  </span>
                ) : null}
              </TD>
              <TD>{l.ip ?? "—"}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </QueryState>
  );
}
