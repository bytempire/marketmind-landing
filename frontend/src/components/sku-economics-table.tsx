"use client";

import { type ReactNode, useMemo, useState } from "react";

import {
  HintLabel,
  formatMoney,
  formatNumber,
  moneyTone,
} from "@/components/commerce-ui";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import type { SkuEconomicsRow, SkuExpenseOverride } from "@/lib/types";
import { cn } from "@/lib/utils";

const FEE_SOURCE_LABEL: Record<SkuEconomicsRow["fee_source"], string> = {
  realization: "факт реализации",
  accrual: "факт начислений",
  tariff: "оценка по тарифу",
};

type OverrideKey = keyof SkuExpenseOverride;

const EXPENSE_FIELDS: {
  key: OverrideKey;
  label: string;
  unit: "%" | "₽/шт";
  hint: string;
  actual: (row: SkuEconomicsRow) => number | null;
}[] = [
  {
    key: "commission_percent",
    label: "Комиссия",
    unit: "%",
    hint: "Комиссия Ozon за продажу. Если есть факт из отчёта — берём его, иначе вашу ставку.",
    actual: (r) => pctOf(r.commission, r.revenue),
  },
  {
    key: "acquiring_percent",
    label: "Эквайринг",
    unit: "%",
    hint: "Процент за приём оплаты. Учитывается, когда у Ozon ещё нет фактической комиссии.",
    actual: () => null,
  },
  {
    key: "logistics_amount",
    label: "Логистика",
    unit: "₽/шт",
    hint: "Доставка до покупателя за 1 шт. Применяется при отсутствии факта логистики.",
    actual: (r) => perUnit(r.logistics, r.units),
  },
  {
    key: "ads_amount",
    label: "Реклама",
    unit: "₽/шт",
    hint: "Расход на рекламу за 1 шт. Применяется, когда нет фактических списаний.",
    actual: (r) => perUnit(r.ads, r.units),
  },
  {
    key: "other_percent",
    label: "Прочие",
    unit: "%",
    hint: "Прочие переменные списания Ozon, % от выручки. Применяются при отсутствии факта.",
    actual: (r) => pctOf(r.other, r.revenue),
  },
  {
    key: "tax_percent",
    label: "Налог",
    unit: "%",
    hint: "Налог с выручки по этому SKU. Если пусто — считается на уровне кабинета.",
    actual: () => null,
  },
];

const COLUMNS: { key: string; label: string; hint: string; align?: "right" }[] =
  [
    {
      key: "product",
      label: "Товар",
      hint: "Название SKU. Ниже — закупка за 1 шт и кнопка «Расходы» с ручными ставками.",
    },
    {
      key: "status",
      label: "Итог",
      hint: "В плюсе — товар приносит деньги. В минусе — каждый выкуп убыточен. Нет закупки — прибыль занижена, задайте себестоимость.",
    },
    {
      key: "buyout",
      label: "Выкуплено",
      hint: "Сколько штук дошло до покупателя. Процент — доля от заказанных. Юнит-экономика считается от выкупа, не от заказа.",
      align: "right",
    },
    {
      key: "revenue",
      label: "Выручка",
      hint: "Деньги с выкупленных штук за период. Не сумма заказов: отмены и невыкуп сюда не входят.",
      align: "right",
    },
    {
      key: "spend",
      label: "Расходы",
      hint: "Закупка + реклама + комиссия, эквайринг, логистика, налог и прочие списания по этому SKU. Постоянные кабинета сюда не входят.",
      align: "right",
    },
    {
      key: "profit",
      label: "Прибыль",
      hint: "Выручка минус расходы SKU. Показывает, здоров ли товар. Зелёный — зарабатываем, красный — просадка.",
      align: "right",
    },
    {
      key: "unit",
      label: "С 1 шт",
      hint: "Прибыль, делённая на выкупленные штуки. Сколько остаётся с одной продажи после переменных расходов.",
      align: "right",
    },
  ];

export function SkuEconomicsTable({
  rows,
  disabled,
  onSaveCost,
  onSaveExpense,
}: {
  rows: SkuEconomicsRow[];
  disabled: boolean;
  onSaveCost: (productId: string, amount: string) => void;
  onSaveExpense: (
    productId: string,
    values: Partial<SkuExpenseOverride>,
  ) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => Number(a.contribution) - Number(b.contribution)),
    [rows],
  );
  const lossCount = sorted.filter((row) => Number(row.contribution) < 0).length;

  return (
    <div>
      <p className="mb-3 text-xs text-[var(--muted-foreground)]">
        Сверху самые убыточные. Наведите на название столбца — что в нём.
        {lossCount > 0
          ? ` В минусе ${lossCount} из ${sorted.length} SKU.`
          : " Убыточных SKU за период нет."}
      </p>
      <Table>
        <THead>
          <TR>
            {COLUMNS.map((col) => (
              <TH
                key={col.key}
                className={col.align === "right" ? "text-right" : undefined}
              >
                <HintLabel hint={col.hint}>{col.label}</HintLabel>
              </TH>
            ))}
          </TR>
        </THead>
        <TBody>
          {sorted.map((row) => {
            const profit = Number(row.contribution);
            const spend = skuSpend(row);
            const rowKey = row.product_id ?? row.sku;
            const isOpen = expanded === rowKey;
            return (
              <RowGroup key={row.sku}>
                <TR className={cn(profit < 0 && "bg-[var(--destructive)]/10")}>
                  <TD>
                    <div className="max-w-[220px] truncate font-medium">
                      {row.title ?? row.sku}
                    </div>
                    <CostInput
                      key={`${rowKey}-${row.net_price ?? ""}`}
                      row={row}
                      disabled={disabled}
                      onSave={onSaveCost}
                    />
                    {row.product_id ? (
                      <button
                        type="button"
                        className="mt-1 text-xs text-[var(--primary)] hover:underline"
                        onClick={() => setExpanded(isOpen ? null : rowKey)}
                      >
                        {isOpen ? "Скрыть расходы" : "Все расходы"}
                      </button>
                    ) : null}
                  </TD>
                  <TD>
                    <StatusBadge row={row} />
                  </TD>
                  <TD className="text-right">
                    <div>{formatNumber(row.units)} шт</div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {row.buyout_rate != null
                        ? `выкуп ${Number(row.buyout_rate).toFixed(0)}%`
                        : "нет % выкупа"}
                      {row.return_qty > 0 ? ` · возврат ${row.return_qty}` : ""}
                    </p>
                  </TD>
                  <TD className="text-right">{formatMoney(row.revenue)}</TD>
                  <TD className="text-right">
                    <div>{formatMoney(spend)}</div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      закупка {formatMoney(row.cogs)} · Ozon{" "}
                      {formatMoney(ozonFees(row))} · реклама{" "}
                      {formatMoney(row.ads)}
                      {Number(row.tax) > 0
                        ? ` · налог ${formatMoney(row.tax)}`
                        : ""}
                    </p>
                  </TD>
                  <TD className={`text-right font-medium ${moneyTone(profit)}`}>
                    {formatMoney(row.contribution)}
                  </TD>
                  <TD className={`text-right ${moneyTone(row.unit_profit)}`}>
                    {row.unit_profit != null
                      ? formatMoney(row.unit_profit)
                      : "—"}
                  </TD>
                </TR>
                {isOpen && row.product_id ? (
                  <TR>
                    <TD colSpan={COLUMNS.length} className="bg-[var(--muted)]/30">
                      <ExpenseEditor
                        row={row}
                        disabled={disabled}
                        onSave={onSaveExpense}
                      />
                    </TD>
                  </TR>
                ) : null}
              </RowGroup>
            );
          })}
        </TBody>
      </Table>
    </div>
  );
}

function RowGroup({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function StatusBadge({ row }: { row: SkuEconomicsRow }) {
  if (row.missing_cogs) {
    return <Badge variant="warning">Нет закупки</Badge>;
  }
  if (Number(row.contribution) < 0) {
    return <Badge variant="destructive">В минусе</Badge>;
  }
  return <Badge variant="success">В плюсе</Badge>;
}

function pctOf(value: string, base: string): number | null {
  const b = Number(base);
  if (!b) return null;
  const v = Number(value);
  if (!v) return null;
  return (v / b) * 100;
}

function perUnit(value: string, units: number): number | null {
  if (!units) return null;
  const v = Number(value);
  if (!v) return null;
  return v / units;
}

function ozonFees(row: SkuEconomicsRow): number {
  return (
    Number(row.commission) +
    Number(row.acquiring) +
    Number(row.logistics) +
    Number(row.storage) +
    Number(row.other)
  );
}

function skuSpend(row: SkuEconomicsRow): number {
  return Number(row.cogs) + Number(row.ads) + ozonFees(row) + Number(row.tax);
}

function CostInput({
  row,
  disabled,
  onSave,
}: {
  row: SkuEconomicsRow;
  disabled: boolean;
  onSave: (productId: string, amount: string) => void;
}) {
  const [value, setValue] = useState(row.net_price ?? "");
  if (!row.product_id) {
    return (
      <p className="text-xs text-[var(--muted-foreground)]">
        {row.missing_cogs ? "Нет себестоимости" : row.sku}
      </p>
    );
  }
  return (
    <label className="mt-1 flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
      <span title="Себестоимость одной штуки">закупка/шт</span>
      <input
        className="h-7 w-24 rounded border border-[var(--border)] bg-transparent px-1"
        type="number"
        min={0}
        step="0.01"
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          if (value !== (row.net_price ?? "") && value !== "") {
            onSave(row.product_id as string, value);
          }
        }}
      />
      {row.cost_source === "user" ? <span>вручную</span> : null}
      {row.missing_cogs ? <span>не задана</span> : null}
      <span className="truncate">{FEE_SOURCE_LABEL[row.fee_source]}</span>
    </label>
  );
}

function ExpenseEditor({
  row,
  disabled,
  onSave,
}: {
  row: SkuEconomicsRow;
  disabled: boolean;
  onSave: (productId: string, values: Partial<SkuExpenseOverride>) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-xs text-[var(--muted-foreground)]">
        Ставки применяются как запасной вариант: пока у Ozon есть факт по
        расходу, считаем по нему. Пусто — берём факт или тариф.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {EXPENSE_FIELDS.map((field) => (
          <ExpenseField
            key={field.key}
            row={row}
            field={field}
            disabled={disabled}
            onSave={onSave}
          />
        ))}
      </div>
    </div>
  );
}

function ExpenseField({
  row,
  field,
  disabled,
  onSave,
}: {
  row: SkuEconomicsRow;
  field: (typeof EXPENSE_FIELDS)[number];
  disabled: boolean;
  onSave: (productId: string, values: Partial<SkuExpenseOverride>) => void;
}) {
  const saved = row.override?.[field.key] ?? "";
  const [value, setValue] = useState<string>(saved);
  const actual = field.actual(row);
  const isManual = saved !== "" && saved != null;

  function save() {
    if (value === saved) return;
    onSave(row.product_id as string, {
      [field.key]: value === "" ? null : value,
    });
  }

  return (
    <label className="flex flex-col gap-1 text-xs">
      <HintLabel hint={field.hint}>
        <span className="text-[var(--muted-foreground)]">
          {field.label}, {field.unit}
        </span>
      </HintLabel>
      <input
        className="h-8 w-full rounded border border-[var(--border)] bg-transparent px-2"
        type="number"
        min={0}
        step={field.unit === "%" ? "0.1" : "0.01"}
        value={value}
        disabled={disabled}
        placeholder={
          actual != null ? `факт ${actual.toFixed(field.unit === "%" ? 1 : 2)}` : "—"
        }
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
      />
      <span className="text-[10px] text-[var(--muted-foreground)]">
        {isManual ? "вручную" : actual != null ? "факт Ozon" : "нет данных"}
      </span>
    </label>
  );
}
