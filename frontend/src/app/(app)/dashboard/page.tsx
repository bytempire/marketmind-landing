"use client";

import { DashboardOverview } from "@/components/dashboard-overview";
import { PageHeader, QueryState } from "@/components/query-state";
import { useDashboard } from "@/lib/hooks";

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  return (
    <div>
      <PageHeader
        title="Обзор"
        description="Продажи, расходы и то, что требует внимания сегодня"
      />
      <QueryState isLoading={isLoading} isError={isError}>
        {data ? <DashboardOverview data={data} /> : null}
      </QueryState>
    </div>
  );
}
