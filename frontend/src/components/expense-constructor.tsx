"use client";

import { useState } from "react";

import { formatMoney } from "@/components/commerce-ui";
import { ExpensePresetWizard } from "@/components/expense-preset-wizard";
import { Button } from "@/components/ui/button";
import type {
  ExpenseCalcType,
  ExpenseItemPublic,
  ExpenseItemWrite,
  ExpenseLevel,
  ExpenseProfilePublic,
} from "@/lib/types";

const CALC_OPTIONS: { id: ExpenseCalcType; label: string }[] = [
  { id: "per_unit", label: "₽ за единицу" },
  { id: "percent_revenue", label: "% от выручки" },
  { id: "per_order", label: "₽ за заказ" },
  { id: "monthly", label: "₽ в месяц" },
  { id: "percent_cogs", label: "% от себестоимости" },
  { id: "percent_ads", label: "% от рекламы" },
  { id: "hybrid", label: "₽/шт + % выручки" },
];

const inputClass =
  "h-9 rounded-md border border-[var(--border)] bg-transparent px-2 text-sm";

export function ExpenseConstructor({
  profile,
  items,
  disabled,
  onSaveProfile,
  onCreate,
  onToggle,
  onDelete,
}: {
  profile: ExpenseProfilePublic | null;
  items: ExpenseItemPublic[];
  disabled: boolean;
  onSaveProfile: (patch: {
    business_model?: ExpenseProfilePublic["business_model"];
    storage_model?: ExpenseProfilePublic["storage_model"];
    tax_system?: ExpenseProfilePublic["tax_system"];
    tax_rate?: string;
  }) => void;
  onCreate: (payload: ExpenseItemWrite) => void;
  onToggle: (item: ExpenseItemPublic, enabled: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [calcType, setCalcType] = useState<ExpenseCalcType>("per_unit");
  const [level, setLevel] = useState<ExpenseLevel>("variable");
  const [amount, setAmount] = useState("0");
  const [percent, setPercent] = useState("0");
  const [wizardOpen, setWizardOpen] = useState(items.length === 0);

  function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate({
      name: trimmed,
      calc_type: calcType,
      level,
      amount,
      percent,
      enabled: true,
    });
    setName("");
    setAmount("0");
    setPercent("0");
  }

  return (
    <div className="flex flex-col gap-4">
      {profile ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-[var(--muted-foreground)]">
              Модель бизнеса
            </span>
            <select
              className={`${inputClass} w-full`}
              value={profile.business_model}
              disabled={disabled}
              onChange={(e) =>
                onSaveProfile({
                  business_model: e.target
                    .value as ExpenseProfilePublic["business_model"],
                })
              }
            >
              <option value="custom">Своя модель</option>
              <option value="manufacturer">Производство</option>
              <option value="reseller_rf">Закупка в РФ</option>
              <option value="china">Китай</option>
              <option value="fulfillment">Фулфилмент</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[var(--muted-foreground)]">
              Хранение
            </span>
            <select
              className={`${inputClass} w-full`}
              value={profile.storage_model}
              disabled={disabled}
              onChange={(e) =>
                onSaveProfile({
                  storage_model: e.target
                    .value as ExpenseProfilePublic["storage_model"],
                })
              }
            >
              <option value="mp">Склад маркетплейса</option>
              <option value="own">Свой склад</option>
              <option value="ff">Фулфилмент</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[var(--muted-foreground)]">
              Налоговая система
            </span>
            <select
              className={`${inputClass} w-full`}
              value={profile.tax_system}
              disabled={disabled}
              onChange={(e) =>
                onSaveProfile({
                  tax_system: e.target.value as ExpenseProfilePublic["tax_system"],
                })
              }
            >
              <option value="usn_income">УСН «доходы»</option>
              <option value="usn_income_outcome">УСН «доходы − расходы»</option>
              <option value="osn">ОСН</option>
              <option value="none">Без налога</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[var(--muted-foreground)]">
              Ставка налога, %
            </span>
            <input
              className={`${inputClass} w-full`}
              type="number"
              min={0}
              max={100}
              step="0.1"
              disabled={disabled}
              defaultValue={profile.tax_rate}
              onBlur={(e) => {
                if (e.target.value !== profile.tax_rate) {
                  onSaveProfile({ tax_rate: e.target.value || "0" });
                }
              }}
            />
          </label>
        </div>
      ) : (
        <p className="text-sm text-[var(--muted-foreground)]">
          Выберите кабинет Ozon, чтобы задать налог и свои расходы.
        </p>
      )}

      {profile ? (
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => setWizardOpen((open) => !open)}
          >
            {wizardOpen ? "Скрыть мастер" : "Мастер модели"}
          </Button>
          {wizardOpen ? (
            <div className="mt-3 rounded-lg border border-[var(--border)] p-3">
              <ExpensePresetWizard
                items={items}
                disabled={disabled}
                defaultModel={profile.business_model}
                defaultStorage={profile.storage_model}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <ItemList
        title="Переменные"
        hint="Входят в contribution и ₽/шт"
        items={items.filter((item) => item.level === "variable")}
        disabled={disabled}
        onToggle={onToggle}
        onDelete={onDelete}
      />
      <ItemList
        title="Постоянные"
        hint="Только операционная прибыль кабинета, не в таблице SKU"
        items={items.filter((item) => item.level === "fixed")}
        disabled={disabled}
        onToggle={onToggle}
        onDelete={onDelete}
      />

      {profile ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6">
          <input
            className={`${inputClass} lg:col-span-2`}
            placeholder="Название, например упаковка"
            value={name}
            disabled={disabled}
            maxLength={120}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className={inputClass}
            value={calcType}
            disabled={disabled}
            onChange={(e) => setCalcType(e.target.value as ExpenseCalcType)}
          >
            {CALC_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            className={inputClass}
            value={level}
            disabled={disabled}
            onChange={(e) => setLevel(e.target.value as ExpenseLevel)}
          >
            <option value="variable">Переменный</option>
            <option value="fixed">Постоянный</option>
          </select>
          <input
            className={inputClass}
            type="number"
            min={0}
            step="0.01"
            value={amount}
            disabled={disabled}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="₽"
          />
          <div className="flex gap-2">
            <input
              className={`${inputClass} w-full`}
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={percent}
              disabled={disabled}
              onChange={(e) => setPercent(e.target.value)}
              placeholder="%"
            />
            <Button type="button" size="sm" disabled={disabled} onClick={add}>
              Добавить
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ItemList({
  title,
  hint,
  items,
  disabled,
  onToggle,
  onDelete,
}: {
  title: string;
  hint: string;
  items: ExpenseItemPublic[];
  disabled: boolean;
  onToggle: (item: ExpenseItemPublic, enabled: boolean) => void;
  onDelete: (id: string) => void;
}) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="mb-2 text-xs text-[var(--muted-foreground)]">{hint}</p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <label className="flex min-w-0 items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={item.enabled}
                disabled={disabled}
                onChange={(e) => onToggle(item, e.target.checked)}
              />
              <span className="truncate">
                {item.name}
                <span className="text-[var(--muted-foreground)]">
                  {" "}
                  · {item.calc_type_label ?? item.calc_type}
                  {item.preset_key ? " · пресет" : ""}
                </span>
              </span>
            </label>
            <div className="flex shrink-0 items-center gap-2">
              <span>{formatMoney(item.computed)}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => onDelete(item.id)}
              >
                Удалить
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
