"use client";

import { useEffect, useRef, useState } from "react";

import { HintLabel, formatMoney, moneyTone } from "@/components/commerce-ui";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import type {
  PricingField,
  PricingInputs,
  PricingRow,
  PricingSchemeResult,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type Drafts = Record<string, Record<PricingField, string>>;
type Results = Record<string, PricingRow>;

const EXTRA_FIELDS: { key: PricingField; label: string; unit: "%" | "₽" }[] = [
  { key: "spp_percent", label: "СПП", unit: "%" },
  { key: "ozon_card_percent", label: "Ozon Карта", unit: "%" },
  { key: "acquiring_percent", label: "Эквайринг", unit: "%" },
  { key: "other_percent", label: "Прочие", unit: "%" },
  { key: "delivery_percent", label: "Доставка", unit: "%" },
  { key: "crossdock", label: "Кросс-докинг", unit: "₽" },
  { key: "storage", label: "Хранение", unit: "₽" },
  { key: "return_logistics_fbo", label: "Обр. логистика FBO", unit: "₽" },
  { key: "return_logistics_fbs", label: "Обр. логистика FBS", unit: "₽" },
  { key: "buyout_fbo_percent", label: "Выкуп FBO", unit: "%" },
  { key: "buyout_fbs_percent", label: "Выкуп FBS", unit: "%" },
  { key: "target_margin_fbo_percent", label: "Целевая маржа FBO", unit: "%" },
  { key: "target_margin_fbs_percent", label: "Целевая маржа FBS", unit: "%" },
];

function inputsToDraft(inputs: PricingInputs): Record<PricingField, string> {
  const draft = {} as Record<PricingField, string>;
  (Object.keys(inputs) as PricingField[]).forEach((key) => {
    const value = inputs[key];
    draft[key] = value == null ? "" : String(value);
  });
  return draft;
}

function draftToInputs(draft: Record<PricingField, string>): PricingInputs {
  const inputs = {} as PricingInputs;
  (Object.keys(draft) as PricingField[]).forEach((key) => {
    const value = draft[key].trim();
    inputs[key] = value === "" ? null : value;
  });
  return inputs;
}

export function PricingTable({
  rows,
  onSave,
  disabled,
}: {
  rows: PricingRow[];
  onSave: (productId: string, inputs: PricingInputs) => Promise<PricingRow>;
  disabled: boolean;
}) {
  const [drafts, setDrafts] = useState<Drafts>(() => seedDrafts(rows));
  const [results, setResults] = useState<Results>(() => seedResults(rows));
  const [expanded, setExpanded] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const draftsRef = useRef<Drafts>(drafts);

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev };
      for (const row of rows) {
        if (!(row.product_id in next)) next[row.product_id] = inputsToDraft(row.inputs);
      }
      return next;
    });
    setResults((prev) => {
      const next = { ...prev };
      for (const row of rows) if (!(row.product_id in next)) next[row.product_id] = row;
      return next;
    });
  }, [rows]);

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((t) => clearTimeout(t));
  }, []);

  function edit(pid: string, field: PricingField, value: string) {
    setDrafts((prev) => {
      const base: Record<PricingField, string> =
        prev[pid] ?? ({} as Record<PricingField, string>);
      return { ...prev, [pid]: { ...base, [field]: value } };
    });
    const existing = timers.current.get(pid);
    if (existing) clearTimeout(existing);
    timers.current.set(
      pid,
      setTimeout(() => {
        const current = draftsRef.current[pid];
        if (!current) return;
        setSavingId(pid);
        onSave(pid, draftToInputs(current))
          .then((row) => setResults((r) => ({ ...r, [pid]: row })))
          .catch(() => undefined)
          .finally(() => setSavingId((s) => (s === pid ? null : s)));
      }, 600),
    );
  }

  const sorted = [...rows].sort((a, b) => {
    const am = Number(results[a.product_id]?.fbs.margin_with_ads ?? 0);
    const bm = Number(results[b.product_id]?.fbs.margin_with_ads ?? 0);
    return am - bm;
  });

  return (
    <div>
      <p className="mb-3 text-xs text-[var(--muted-foreground)]">
        Меняйте цену и ставки прямо в ячейках — маржа и рекомендуемая цена
        пересчитаются и сохранятся. Красным — уходите в минус, зелёным —
        зарабатываете. «₽ расходы» — сколько с одной продажи уходит: наведите,
        чтобы увидеть, за что именно.
      </p>
      <Table>
        <THead>
          <TR>
            <TH rowSpan={2}>Товар</TH>
            <TH colSpan={4} className="text-center">
              Общее
            </TH>
            <TH
              colSpan={5}
              className="border-l border-[var(--border)] text-center"
            >
              FBO
            </TH>
            <TH
              colSpan={5}
              className="border-l border-[var(--border)] text-center"
            >
              FBS
            </TH>
          </TR>
          <TR>
            <TH className="text-right">Цена ₽</TH>
            <TH className="text-right">Себест. ₽</TH>
            <TH className="text-right">Реклама %</TH>
            <TH className="text-right">Налог %</TH>
            <TH className="border-l border-[var(--border)] text-right">
              Комис. %
            </TH>
            <TH className="text-right">Логист. ₽</TH>
            <TH className="text-right">Расходы ₽</TH>
            <TH className="text-right">Маржа</TH>
            <TH className="text-right">Реком. цена</TH>
            <TH className="border-l border-[var(--border)] text-right">
              Комис. %
            </TH>
            <TH className="text-right">Логист. ₽</TH>
            <TH className="text-right">Расходы ₽</TH>
            <TH className="text-right">Маржа</TH>
            <TH className="text-right">Реком. цена</TH>
          </TR>
        </THead>
        <TBody>
          {sorted.map((base) => {
            const pid = base.product_id;
            const draft = drafts[pid] ?? inputsToDraft(base.inputs);
            const result = results[pid] ?? base;
            const isOpen = expanded === pid;
            const worst = Math.min(
              Number(result.fbo.margin_with_ads),
              Number(result.fbs.margin_with_ads),
            );
            return (
              <RowFragment key={pid}>
                <TR className={cn(worst < 0 && "bg-[var(--destructive)]/10")}>
                  <TD>
                    <div className="max-w-[200px] truncate font-medium">
                      {base.title ?? base.sku}
                    </div>
                    <button
                      type="button"
                      className="text-xs text-[var(--primary)] hover:underline"
                      onClick={() => setExpanded(isOpen ? null : pid)}
                    >
                      {isOpen ? "Скрыть параметры" : "Ещё параметры"}
                    </button>
                    {savingId === pid ? (
                      <span className="ml-2 text-[10px] text-[var(--muted-foreground)]">
                        сохранение…
                      </span>
                    ) : null}
                  </TD>
                  <NumCell
                    value={draft.price}
                    disabled={disabled}
                    step="1"
                    onChange={(v) => edit(pid, "price", v)}
                  />
                  <NumCell
                    value={draft.cogs}
                    disabled={disabled}
                    step="0.01"
                    onChange={(v) => edit(pid, "cogs", v)}
                  />
                  <NumCell
                    value={draft.marketing_percent}
                    disabled={disabled}
                    step="0.1"
                    onChange={(v) => edit(pid, "marketing_percent", v)}
                  />
                  <NumCell
                    value={draft.tax_percent}
                    disabled={disabled}
                    step="0.1"
                    onChange={(v) => edit(pid, "tax_percent", v)}
                  />
                  <SchemeCells
                    scheme="fbo"
                    draft={draft}
                    result={result.fbo}
                    disabled={disabled}
                    onEdit={(field, v) => edit(pid, field, v)}
                  />
                  <SchemeCells
                    scheme="fbs"
                    draft={draft}
                    result={result.fbs}
                    disabled={disabled}
                    onEdit={(field, v) => edit(pid, field, v)}
                  />
                </TR>
                {isOpen ? (
                  <TR>
                    <TD colSpan={15} className="bg-[var(--muted)]/30">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                        {EXTRA_FIELDS.map((f) => (
                          <label
                            key={f.key}
                            className="flex flex-col gap-1 text-xs"
                          >
                            <span className="text-[var(--muted-foreground)]">
                              {f.label}, {f.unit}
                            </span>
                            <input
                              className="h-8 w-full rounded border border-[var(--border)] bg-transparent px-2"
                              type="number"
                              min={0}
                              step={f.unit === "%" ? "0.1" : "0.01"}
                              value={draft[f.key] ?? ""}
                              disabled={disabled}
                              onChange={(e) => edit(pid, f.key, e.target.value)}
                            />
                          </label>
                        ))}
                      </div>
                    </TD>
                  </TR>
                ) : null}
              </RowFragment>
            );
          })}
        </TBody>
      </Table>
    </div>
  );
}

function RowFragment({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function SchemeCells({
  scheme,
  draft,
  result,
  disabled,
  onEdit,
}: {
  scheme: "fbo" | "fbs";
  draft: Record<PricingField, string>;
  result: PricingSchemeResult;
  disabled: boolean;
  onEdit: (field: PricingField, value: string) => void;
}) {
  const commissionKey = `commission_${scheme}_percent` as PricingField;
  const logisticsKey = `logistics_${scheme}` as PricingField;
  const margin = Number(result.margin_with_ads);
  return (
    <>
      <NumCell
        className="border-l border-[var(--border)]"
        value={draft[commissionKey]}
        disabled={disabled}
        step="0.1"
        onChange={(v) => onEdit(commissionKey, v)}
      />
      <NumCell
        value={draft[logisticsKey]}
        disabled={disabled}
        step="0.01"
        onChange={(v) => onEdit(logisticsKey, v)}
      />
      <TD className="text-right">
        <HintLabel hint={costBreakdown(result)}>
          <span>{formatMoney(result.total_costs)}</span>
        </HintLabel>
      </TD>
      <TD className={cn("text-right font-medium", moneyTone(margin))}>
        <div>{formatMoney(result.margin_with_ads)}</div>
        <div className="text-[10px] text-[var(--muted-foreground)]">
          {result.margin_with_ads_pct != null
            ? `${Number(result.margin_with_ads_pct).toFixed(1)}%`
            : "—"}
          {" · без рекл. "}
          {formatMoney(result.margin_no_ads)}
        </div>
      </TD>
      <TD className="text-right">
        {result.price_at_target != null ? (
          <HintLabel hint="Цена в ЛК, при которой достигается целевая маржа (её меняйте в «Ещё параметры»).">
            <span className="font-medium">
              {formatMoney(result.price_at_target)}
            </span>
          </HintLabel>
        ) : (
          "—"
        )}
      </TD>
    </>
  );
}

function NumCell({
  value,
  disabled,
  step,
  onChange,
  className,
}: {
  value: string;
  disabled: boolean;
  step: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <TD className={cn("text-right", className)}>
      <input
        className="h-8 w-20 rounded border border-[var(--border)] bg-transparent px-2 text-right"
        type="number"
        min={0}
        step={step}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </TD>
  );
}

function costBreakdown(r: PricingSchemeResult): string {
  const parts = [
    `Закупка ${money(r.cost_cogs)}`,
    `Комиссия ${money(r.cost_commission)}`,
    `Эквайринг ${money(r.cost_acquiring)}`,
    `Логистика ${money(r.cost_logistics)}`,
    `Хранение ${money(r.cost_storage)}`,
    `Прочие ${money(r.cost_other)}`,
    `Налог ${money(r.cost_tax)}`,
    `Реклама ${money(r.cost_ads)}`,
  ];
  return `Расход с 1 продажи: ${parts.join(" · ")}`;
}

function money(value: string): string {
  return formatMoney(value);
}

function seedDrafts(rows: PricingRow[]): Drafts {
  const out: Drafts = {};
  for (const row of rows) out[row.product_id] = inputsToDraft(row.inputs);
  return out;
}

function seedResults(rows: PricingRow[]): Results {
  const out: Results = {};
  for (const row of rows) out[row.product_id] = row;
  return out;
}
