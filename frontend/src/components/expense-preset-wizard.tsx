"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useApplyExpensePreset, useExpensePresets } from "@/lib/hooks";
import type {
  BusinessModel,
  ExpenseItemPublic,
  PresetItemPublic,
  StorageModel,
} from "@/lib/types";

const inputClass =
  "h-9 rounded-md border border-[var(--border)] bg-transparent px-2 text-sm";

function mergeItems(
  modelItems: PresetItemPublic[],
  storageItems: PresetItemPublic[],
  commonFixed: PresetItemPublic[],
): PresetItemPublic[] {
  const out = new Map<string, PresetItemPublic>();
  for (const item of [...modelItems, ...storageItems, ...commonFixed]) {
    if (!out.has(item.key)) out.set(item.key, item);
  }
  return [...out.values()];
}

export function ExpensePresetWizard({
  items,
  disabled,
  defaultModel,
  defaultStorage,
}: {
  items: ExpenseItemPublic[];
  disabled: boolean;
  defaultModel?: BusinessModel;
  defaultStorage?: StorageModel;
}) {
  const presets = useExpensePresets();
  const apply = useApplyExpensePreset();
  const catalog = presets.data;
  const firstModel = catalog?.models[0]?.business_model ?? "manufacturer";
  const [model, setModel] = useState<BusinessModel>(
    defaultModel && defaultModel !== "custom" ? defaultModel : firstModel,
  );
  const [storage, setStorage] = useState<StorageModel>(
    defaultStorage ?? "mp",
  );
  const [values, setValues] = useState<Record<string, { amount: string; percent: string }>>(
    {},
  );

  const selected = catalog?.models.find((row) => row.business_model === model);
  const combined = useMemo(() => {
    if (!catalog || !selected) return [];
    return mergeItems(
      selected.items,
      catalog.storage[storage] ?? [],
      catalog.common_fixed,
    );
  }, [catalog, selected, storage]);

  const itemsKey = items
    .map((row) => `${row.preset_key}:${row.amount}:${row.percent}`)
    .join("|");

  useEffect(() => {
    if (!combined.length) return;
    setValues((prev) => {
      const next: Record<string, { amount: string; percent: string }> = {};
      for (const spec of combined) {
        const existing = items.find((row) => row.preset_key === spec.key);
        next[spec.key] = prev[spec.key] ?? {
          amount: existing?.amount ?? "0",
          percent: existing?.percent ?? "0",
        };
      }
      return next;
    });
  }, [combined, itemsKey]);

  const variable = combined.filter((row) => row.level === "variable");
  const fixed = combined.filter((row) => row.level === "fixed");

  function setField(key: string, field: "amount" | "percent", value: string) {
    setValues((prev) => ({
      ...prev,
      [key]: { amount: "0", percent: "0", ...prev[key], [field]: value },
    }));
  }

  function submit() {
    const payload: Record<string, { amount: string; percent: string }> = {};
    for (const [key, value] of Object.entries(values)) {
      payload[key] = {
        amount: value.amount === "" ? "0" : value.amount,
        percent: value.percent === "" ? "0" : value.percent,
      };
    }
    apply.mutate({
      business_model: model,
      storage_model: storage,
      values: payload,
    });
  }

  if (presets.isError) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">
        Не удалось загрузить шаблоны расходов.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[var(--muted-foreground)]">
        Закупка остаётся в себестоимости SKU. Постоянные не попадают в ₽/шт
        таблицы.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {(catalog?.models ?? []).map((row) => (
          <button
            key={row.business_model}
            type="button"
            disabled={disabled}
            onClick={() => {
              setModel(row.business_model);
              setStorage(row.default_storage);
            }}
            className={
              model === row.business_model
                ? "rounded-lg border border-[var(--primary)] bg-[var(--muted)] p-3 text-left"
                : "rounded-lg border border-[var(--border)] p-3 text-left"
            }
          >
            <div className="text-sm font-medium">{row.label}</div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {row.description}
            </p>
          </button>
        ))}
      </div>
      <label className="text-sm">
        <span className="mb-1 block text-[var(--muted-foreground)]">
          Где хранится товар
        </span>
        <select
          className={`${inputClass} w-full max-w-xs`}
          value={storage}
          disabled={disabled}
          onChange={(e) => setStorage(e.target.value as StorageModel)}
        >
          <option value="mp">Склад маркетплейса</option>
          <option value="own">Свой склад</option>
          <option value="ff">Фулфилмент</option>
        </select>
      </label>
      <ItemGroup
        title="Переменные — в contribution и ₽/шт"
        specs={variable}
        values={values}
        disabled={disabled}
        onChange={setField}
      />
      <ItemGroup
        title="Постоянные — только прибыль кабинета"
        specs={fixed}
        values={values}
        disabled={disabled}
        onChange={setField}
      />
      <div>
        <Button
          type="button"
          disabled={disabled || apply.isPending || !selected}
          onClick={submit}
        >
          {apply.isPending ? "Сохраняем…" : "Применить пресет"}
        </Button>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Свои статьи с другим названием не удалятся. Пустые суммы создаются
          выключенными.
        </p>
      </div>
    </div>
  );
}

function ItemGroup({
  title,
  specs,
  values,
  disabled,
  onChange,
}: {
  title: string;
  specs: PresetItemPublic[];
  values: Record<string, { amount: string; percent: string }>;
  disabled: boolean;
  onChange: (key: string, field: "amount" | "percent", value: string) => void;
}) {
  if (!specs.length) return null;
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      <ul className="flex flex-col gap-2">
        {specs.map((spec) => {
          const row = values[spec.key] ?? { amount: "0", percent: "0" };
          const needsPercent =
            spec.calc_type.includes("percent") || spec.calc_type === "hybrid";
          const needsAmount =
            spec.calc_type !== "percent_revenue" &&
            spec.calc_type !== "percent_cogs" &&
            spec.calc_type !== "percent_ads";
          return (
            <li
              key={spec.key}
              className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_7rem_5rem]"
            >
              <div>
                <div className="text-sm">{spec.name}</div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {spec.calc_type_label ?? spec.calc_type} · {spec.hint}
                </p>
              </div>
              {needsAmount ? (
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  step="0.01"
                  value={row.amount}
                  disabled={disabled}
                  onChange={(e) => onChange(spec.key, "amount", e.target.value)}
                  placeholder="₽"
                />
              ) : (
                <span />
              )}
              {needsPercent ? (
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={row.percent}
                  disabled={disabled}
                  onChange={(e) => onChange(spec.key, "percent", e.target.value)}
                  placeholder="%"
                />
              ) : (
                <span />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
