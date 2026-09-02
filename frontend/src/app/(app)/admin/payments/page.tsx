"use client";

import { QueryState } from "@/components/query-state";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useAdminPayments } from "@/lib/hooks";
import type { PaymentStatus } from "@/lib/types";

const STATUS_VARIANT: Record<
  PaymentStatus,
  "success" | "warning" | "destructive" | "secondary"
> = {
  succeeded: "success",
  pending: "warning",
  failed: "destructive",
  refunded: "secondary",
};

export default function AdminPaymentsPage() {
  const { data, isLoading, isError } = useAdminPayments();

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      isEmpty={data?.length === 0}
      emptyText="Платежей пока нет"
    >
      <Table>
        <THead>
          <TR>
            <TH>Email</TH>
            <TH>Сумма</TH>
            <TH>Статус</TH>
            <TH>Провайдер</TH>
            <TH>Дата</TH>
          </TR>
        </THead>
        <TBody>
          {data?.map((p) => (
            <TR key={p.id}>
              <TD>{p.user_email}</TD>
              <TD>
                {p.amount.toLocaleString("ru-RU")} {p.currency}
              </TD>
              <TD>
                <Badge variant={STATUS_VARIANT[p.status]}>{p.status}</Badge>
              </TD>
              <TD>{p.provider ?? "—"}</TD>
              <TD>{new Date(p.created_at).toLocaleString("ru-RU")}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </QueryState>
  );
}
