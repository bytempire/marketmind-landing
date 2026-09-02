"use client";

import { ActionsSection } from "@/components/marketing-actions";
import { AutoAddSection } from "@/components/marketing-auto-add";
import { MarketingSection } from "@/components/marketing-ui";
import { PageHeader, QueryState } from "@/components/query-state";
import { Notice } from "@/components/ui/notice";
import { useOzonAutoSync } from "@/components/ozon-sync-controls";
import { useMarketingActions } from "@/lib/hooks";
import { useCabinet } from "@/lib/marketplace-cabinet";
import Link from "next/link";

export default function MarketingActionsPage() {
  const { selected, marketplaces } = useCabinet();
  const isWbOnly = selected?.type === "wb";
  const hasOzon = marketplaces.some((m) => m.type === "ozon");
  const actions = useMarketingActions();
  useOzonAutoSync("marketing");

  return (
    <div>
      <PageHeader
        title="Акции"
        description="Промо Ozon: какие акции доступны кабинету и какие товары уже участвуют"
      />

      {isWbOnly || !hasOzon ? (
        <Notice className="mb-4">
          {!hasOzon ? (
            <>
              Чтобы увидеть акции Ozon, сначала подключите кабинет Ozon в{" "}
              <Link href="/marketplaces" className="underline">
                Кабинетах
              </Link>{" "}
              (Client-Id и Api-Key Seller API). Данные подтянутся сами.
            </>
          ) : (
            <>
              Сейчас выбран Wildberries. Выберите кабинет Ozon слева — акции
              подтянутся из Seller API.
            </>
          )}
        </Notice>
      ) : null}

      {hasOzon && !isWbOnly ? <AutoAddSection /> : null}

      <MarketingSection
        title="Акции Ozon"
        why="Какие промо доступны кабинету и какие товары уже в акции (Seller API)."
      >
        {!hasOzon ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Кабинета Ozon ещё нет.{" "}
            <Link href="/marketplaces" className="underline">
              Подключить Ozon
            </Link>
          </p>
        ) : isWbOnly ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Выберите кабинет Ozon слева, чтобы увидеть список акций.
          </p>
        ) : (
          <QueryState
            isLoading={actions.isLoading}
            isError={actions.isError}
            isEmpty={false}
          >
            {actions.data ? (
              <>
                <p className="mb-4 text-sm text-[var(--muted-foreground)]">
                  Всего акций:{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    {actions.data.total}
                  </span>
                  , участвуете в{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    {actions.data.participating}
                  </span>
                  .
                </p>
                <ActionsSection items={actions.data.items} />
              </>
            ) : null}
          </QueryState>
        )}
      </MarketingSection>
    </div>
  );
}
