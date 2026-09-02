"use client";

import { MarketingSection, MarketingStat } from "@/components/marketing-ui";
import { PageHeader, QueryState } from "@/components/query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { useOzonAutoSync } from "@/components/ozon-sync-controls";
import {
  useMarketingCampaigns,
  useMarketingSeries,
  useMarketingSkuGroups,
  useMarketingSummary,
} from "@/lib/hooks";
import {
  MARKETING_PERIODS,
  campaignTypeLabel,
  drrHint,
  drrTone,
  formatMoney,
  formatNumber,
  formatPct,
  formatPeriod,
  paymentLabel,
  periodRange,
  stateLabel,
  type MarketingPeriodDays,
  type MarketingPeriodMode,
} from "@/lib/marketing-format";
import { useCabinet } from "@/lib/marketplace-cabinet";
import type { CampaignItem, SkuGroupMarketingItem } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

function pickInsights(
  campaigns: CampaignItem[],
  groups: SkuGroupMarketingItem[],
): string[] {
  const tips: string[] = [];
  const costly = campaigns
    .filter((c) => Number(c.spend) > 0)
    .filter((c) => c.drr != null && Number(c.drr) > 30)
    .slice(0, 2);
  for (const c of costly) {
    tips.push(
      `Кампания «${c.title ?? c.external_id}»: ДРР ${formatPct(c.drr)} при расходе ${formatMoney(c.spend)} — снизьте ставки или отключите слабые товары.`,
    );
  }
  const spendNoOrders = campaigns
    .filter((c) => Number(c.spend) > 500 && Number(c.orders) === 0)
    .slice(0, 1);
  for (const c of spendNoOrders) {
    tips.push(
      `«${c.title ?? c.external_id}» тратит бюджет без заказов — проверьте ставки и карточки товаров.`,
    );
  }
  const weakSku = groups
    .filter((s) => s.drr != null && Number(s.drr) > 35 && Number(s.spend) > 300)
    .slice(0, 2);
  for (const s of weakSku) {
    tips.push(
      `Склейка ${s.group_key}${s.title ? ` (${s.title})` : ""}: ДРР ${formatPct(s.drr)} — кандидат на паузу в рекламе.`,
    );
  }
  if (tips.length === 0 && campaigns.some((c) => Number(c.spend) > 0)) {
    tips.push(
      "Критических перекосов по ДРР нет. Смотрите топ SKU: куда уходит бюджет и что реально продаёт.",
    );
  }
  return tips.slice(0, 4);
}

export default function MarketingAdsPage() {
  const { selected, marketplaces } = useCabinet();
  const isWbOnly = selected?.type === "wb";
  const hasOzon = marketplaces.some((m) => m.type === "ozon");

  const [mode, setMode] = useState<MarketingPeriodMode>(30);
  const preset = useMemo(
    () => (mode === "custom" ? null : periodRange(mode)),
    [mode],
  );
  const [customFrom, setCustomFrom] = useState(() => periodRange(30).dateFrom);
  const [customTo, setCustomTo] = useState(() => periodRange(30).dateTo);

  const dateFrom = mode === "custom" ? customFrom : preset!.dateFrom;
  const dateTo = mode === "custom" ? customTo : preset!.dateTo;
  const rangeInvalid =
    mode === "custom" && (!dateFrom || !dateTo || dateFrom > dateTo);

  const summary = useMarketingSummary(
    rangeInvalid ? undefined : dateFrom,
    rangeInvalid ? undefined : dateTo,
  );
  const series = useMarketingSeries(
    rangeInvalid ? undefined : dateFrom,
    rangeInvalid ? undefined : dateTo,
  );
  const campaigns = useMarketingCampaigns(
    rangeInvalid ? undefined : dateFrom,
    rangeInvalid ? undefined : dateTo,
  );
  const skuGroups = useMarketingSkuGroups(
    rangeInvalid ? undefined : dateFrom,
    rangeInvalid ? undefined : dateTo,
  );
  useOzonAutoSync("marketing");

  const noToken =
    !isWbOnly && summary.data && !summary.data.has_performance_token;
  const hasSpend = Number(summary.data?.spend ?? 0) > 0;
  const hasAdActivity =
    hasSpend ||
    Number(summary.data?.views ?? 0) > 0 ||
    Number(summary.data?.clicks ?? 0) > 0;
  const hasAttributedOrders =
    Number(summary.data?.orders ?? 0) > 0 ||
    Number(summary.data?.orders_money ?? 0) > 0;
  /** Ozon can attribute orders to past clicks with 0 spend/views/clicks in the selected days. */
  const delayedAttribution = hasAttributedOrders && !hasAdActivity;
  const insights = pickInsights(
    campaigns.data?.items ?? [],
    skuGroups.data?.items ?? [],
  );

  function selectPreset(days: MarketingPeriodDays) {
    setMode(days);
  }

  function selectCustom() {
    if (mode !== "custom" && preset) {
      setCustomFrom(preset.dateFrom);
      setCustomTo(preset.dateTo);
    }
    setMode("custom");
  }

  return (
    <div>
      <PageHeader
        title="Реклама"
        description="Ozon Performance: бюджет, ДРР, кампании и товары в рекламе"
      />

      {isWbOnly || !hasOzon ? (
        <Notice className="mb-4">
          {!hasOzon ? (
            <>
              Чтобы увидеть рекламу Ozon, сначала подключите кабинет Ozon в{" "}
              <Link href="/marketplaces" className="underline">
                Кабинетах
              </Link>{" "}
              (Client-Id и Api-Key Seller API), затем добавьте ключи Performance
              API. Данные подтянутся сами.
            </>
          ) : (
            <>
              Сейчас выбран Wildberries. Выберите кабинет Ozon слева — реклама
              подтянется из Performance API.
            </>
          )}
        </Notice>
      ) : null}

      {noToken && hasOzon && !isWbOnly ? (
        <Notice className="mb-4">
          Ключи Performance API не подключены — статистика рекламы недоступна.
          Performance подключается в{" "}
          <Link href="/marketplaces" className="underline">
            Кабинетах
          </Link>
          .
        </Notice>
      ) : null}

      {isWbOnly || !hasOzon ? null : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {MARKETING_PERIODS.map((p) => (
                <Button
                  key={p.days}
                  type="button"
                  size="sm"
                  variant={mode === p.days ? "default" : "outline"}
                  onClick={() => selectPreset(p.days)}
                >
                  {p.label}
                </Button>
              ))}
              <Button
                type="button"
                size="sm"
                variant={mode === "custom" ? "default" : "outline"}
                onClick={selectCustom}
              >
                Свои даты
              </Button>
            </div>
            {mode === "custom" ? (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <label className="text-[var(--muted-foreground)]">
                  с
                  <input
                    type="date"
                    className="ml-2 h-9 rounded-lg border border-[var(--border)] bg-transparent px-2"
                    value={customFrom}
                    max={customTo || undefined}
                    onChange={(e) => setCustomFrom(e.target.value)}
                  />
                </label>
                <label className="text-[var(--muted-foreground)]">
                  по
                  <input
                    type="date"
                    className="ml-2 h-9 rounded-lg border border-[var(--border)] bg-transparent px-2"
                    value={customTo}
                    min={customFrom || undefined}
                    onChange={(e) => setCustomTo(e.target.value)}
                  />
                </label>
              </div>
            ) : null}
          </div>

          {rangeInvalid ? (
            <Notice className="mb-4">
              Проверьте даты: «с» не может быть позже «по».
            </Notice>
          ) : null}

          {summary.data && !noToken && !rangeInvalid ? (
            <p className="mb-4 text-sm text-[var(--muted-foreground)]">
              Период:{" "}
              <span className="font-medium text-[var(--foreground)]">
                {formatPeriod(summary.data.period_from, summary.data.period_to)}
              </span>
              . ДРР = расход ÷ выручка с рекламы × 100. Чем ниже — тем
              эффективнее.
            </p>
          ) : null}

          {delayedAttribution && !noToken && !rangeInvalid ? (
            <Notice className="mb-4" variant="info">
              Заказы и выручка есть, а показов, кликов и расхода в эти дни нет —
              так отдаёт Ozon. Обычно это заказы по кликам прошлых дней (окно
              атрибуции), а не новая реклама в выбранном периоде. Расширьте
              интервал, чтобы увидеть дни с показами.
            </Notice>
          ) : null}

          <QueryState
            isLoading={summary.isLoading}
            isError={summary.isError}
            isEmpty={false}
          >
            {summary.data ? (
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MarketingStat
                  label="Расход на рекламу"
                  value={formatMoney(summary.data.spend)}
                  hint="Сколько списано с рекламного бюджета за период"
                />
                <MarketingStat
                  label="Выручка с рекламы"
                  value={formatMoney(summary.data.orders_money)}
                  hint={
                    delayedAttribution
                      ? "Ozon отнёс заказы к рекламе без расхода в эти дни — чаще всего по кликам раньше"
                      : "Сумма заказов, которые Ozon атрибутировал рекламе"
                  }
                />
                <MarketingStat
                  label="ДРР"
                  value={formatPct(summary.data.drr)}
                  hint={drrHint(summary.data.drr)}
                />
                <MarketingStat
                  label="Крутились за период"
                  value={`${summary.data.campaigns_running} из ${summary.data.campaigns_total}`}
                  hint="Были показы, клики или расход / всего кампаний в кабинете"
                />
                <MarketingStat
                  label="Показы"
                  value={formatNumber(summary.data.views)}
                  hint="Сколько раз объявления показали покупателям"
                />
                <MarketingStat
                  label="Клики"
                  value={formatNumber(summary.data.clicks)}
                  hint="Переходы в карточку товара с рекламы"
                />
                <MarketingStat
                  label="CTR"
                  value={formatPct(summary.data.ctr)}
                  hint="Клики ÷ показы. Ниже 1% — слабый креатив или ставка"
                />
                <MarketingStat
                  label="Заказы с рекламы"
                  value={formatNumber(summary.data.orders)}
                  hint={
                    delayedAttribution
                      ? "Атрибуция Performance: заказ может попасть в день без показов/кликов"
                      : "Количество заказов по атрибуции Performance"
                  }
                />
              </div>
            ) : null}
          </QueryState>

          {!noToken && hasSpend && insights.length > 0 ? (
            <MarketingSection
              title="На что смотреть"
              why="Короткие выводы по перекосам: высокий ДРР, расход без заказов, слабые SKU."
            >
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
                {insights.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </MarketingSection>
          ) : null}

          {!noToken &&
          !hasSpend &&
          !delayedAttribution &&
          !summary.isLoading &&
          !rangeInvalid ? (
            <Notice className="mb-6" variant="info">
              Расхода за выбранный период нет. Попробуйте другой интервал.
            </Notice>
          ) : null}

          <MarketingSection
            title="Динамика по дням"
            why="Чтобы увидеть всплески бюджета и провалы по заказам — не только итог за период."
          >
            <QueryState
              isLoading={series.isLoading}
              isError={series.isError}
              isEmpty={(series.data?.series.length ?? 0) === 0}
              emptyText="Нет дневных данных. Синхронизация с Ozon идёт автоматически."
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                      <th className="pb-2 pr-4 font-medium">Дата</th>
                      <th className="pb-2 pr-4 font-medium">Расход</th>
                      <th className="pb-2 pr-4 font-medium">Клики</th>
                      <th className="pb-2 pr-4 font-medium">Заказы</th>
                      <th className="pb-2 font-medium">Выручка с рекламы</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(series.data?.series ?? [])
                      .slice()
                      .reverse()
                      .map((row) => (
                        <tr
                          key={row.date}
                          className="border-b border-[var(--border)]/60"
                        >
                          <td className="py-2 pr-4">
                            {new Date(
                              `${row.date}T12:00:00`,
                            ).toLocaleDateString("ru-RU")}
                          </td>
                          <td className="py-2 pr-4">
                            {formatMoney(row.spend)}
                          </td>
                          <td className="py-2 pr-4">
                            {formatNumber(row.clicks)}
                          </td>
                          <td className="py-2 pr-4">
                            {formatNumber(row.orders)}
                          </td>
                          <td className="py-2">
                            {formatMoney(row.orders_money)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </QueryState>
          </MarketingSection>

          <MarketingSection
            title="Кампании"
            why="Сравнивайте расход и ДРР: где бюджет работает, а где «горит»."
          >
            <QueryState
              isLoading={campaigns.isLoading}
              isError={campaigns.isError}
              isEmpty={(campaigns.data?.items.length ?? 0) === 0}
              emptyText="Кампаний нет. Создайте рекламу в кабинете Ozon Performance и обновите данные."
            >
              <div className="flex flex-col gap-4">
                {(campaigns.data?.items ?? []).slice(0, 20).map((c) => {
                  const pay = paymentLabel(c.payment_type);
                  return (
                    <div
                      key={c.external_id}
                      className="border-b border-[var(--border)]/60 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {c.title ?? `Кампания ${c.external_id}`}
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            <Badge variant="secondary">
                              {stateLabel(c.state)}
                            </Badge>
                            <Badge variant="secondary">
                              {campaignTypeLabel(c.adv_object_type)}
                            </Badge>
                            {pay ? (
                              <Badge variant="secondary">Оплата {pay}</Badge>
                            ) : null}
                          </div>
                        </div>
                        <Badge variant={drrTone(c.drr)}>
                          ДРР {formatPct(c.drr)}
                        </Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--muted-foreground)] sm:grid-cols-4">
                        <div>
                          <div>Расход</div>
                          <div className="text-sm font-medium text-[var(--foreground)]">
                            {formatMoney(c.spend)}
                          </div>
                        </div>
                        <div>
                          <div>Выручка</div>
                          <div className="text-sm font-medium text-[var(--foreground)]">
                            {formatMoney(c.orders_money)}
                          </div>
                        </div>
                        <div>
                          <div>Клики / CTR</div>
                          <div className="text-sm font-medium text-[var(--foreground)]">
                            {formatNumber(c.clicks)} · {formatPct(c.ctr)}
                          </div>
                        </div>
                        <div>
                          <div>Заказы</div>
                          <div className="text-sm font-medium text-[var(--foreground)]">
                            {formatNumber(c.orders)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </QueryState>
          </MarketingSection>

          <MarketingSection
            title="Товары в рекламе (по склейке)"
            why="Группа учитывает сценарий: рекламировали один SKU, а заказали другой из той же склейки."
          >
            <QueryState
              isLoading={skuGroups.isLoading}
              isError={skuGroups.isError}
              isEmpty={(skuGroups.data?.items.length ?? 0) === 0}
              emptyText="Детализация по склейкам ещё не подтянулась. Обновите данные и подождите 1–2 минуты (отчёт асинхронный)."
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                      <th className="pb-2 pr-4 font-medium">Склейка</th>
                      <th className="pb-2 pr-4 font-medium">Показы</th>
                      <th className="pb-2 pr-4 font-medium">Клики</th>
                      <th className="pb-2 pr-4 font-medium">Корзины</th>
                      <th className="pb-2 pr-4 font-medium">Заказы</th>
                      <th className="pb-2 pr-4 font-medium">Сумма заказов</th>
                      <th className="pb-2 pr-4 font-medium">Расход</th>
                      <th className="pb-2 pr-4 font-medium">Доход</th>
                      <th className="pb-2 font-medium">ДРР</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(skuGroups.data?.items ?? []).slice(0, 20).map((g) => (
                      <tr
                        key={g.group_key}
                        className="border-b border-[var(--border)]/60"
                      >
                        <td className="py-2 pr-4">
                          <div className="font-medium">
                            {g.title ?? `Склейка ${g.group_key}`}
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)]">
                            Группа {g.group_key}
                          </div>
                        </td>
                        <td className="py-2 pr-4">{formatNumber(g.views)}</td>
                        <td className="py-2 pr-4">{formatNumber(g.clicks)}</td>
                        <td className="py-2 pr-4">
                          {g.carts == null ? "—" : formatNumber(g.carts)}
                        </td>
                        <td className="py-2 pr-4">{formatNumber(g.orders)}</td>
                        <td className="py-2 pr-4">
                          {formatMoney(g.orders_money)}
                        </td>
                        <td className="py-2 pr-4">{formatMoney(g.spend)}</td>
                        <td className="py-2 pr-4">{formatMoney(g.income)}</td>
                        <td className="py-2">
                          <Badge variant={drrTone(g.drr)}>
                            {formatPct(g.drr)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </QueryState>
          </MarketingSection>
        </>
      )}
    </div>
  );
}
