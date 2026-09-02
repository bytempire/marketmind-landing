"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

export type DateRange = { from: Date; to: Date };

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function atNoon(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12);
}

export function toIsoDate(value: Date): string {
  const d = atNoon(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function rangeOfDays(days: number, end: Date = new Date()): DateRange {
  const to = atNoon(end);
  const from = atNoon(to);
  from.setDate(from.getDate() - (days - 1));
  return { from, to };
}

function sameDay(a: Date, b: Date): boolean {
  return toIsoDate(a) === toIsoDate(b);
}

function inRange(day: Date, from: Date, to: Date): boolean {
  const key = toIsoDate(day);
  return key >= toIsoDate(from) && key <= toIsoDate(to);
}

function clampDay(day: Date, minDate: Date, maxDate: Date): Date {
  const key = toIsoDate(day);
  if (key < toIsoDate(minDate)) return atNoon(minDate);
  if (key > toIsoDate(maxDate)) return atNoon(maxDate);
  return atNoon(day);
}

function monthGrid(month: Date): (Date | null)[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1, 12);
  const lead = (first.getDay() + 6) % 7;
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= count; day += 1) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day, 12));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function RangeCalendar({
  range,
  minDate,
  maxDate,
  onChange,
}: {
  range: DateRange;
  minDate: Date;
  maxDate: Date;
  onChange: (next: DateRange) => void;
}) {
  const [view, setView] = useState(() => atNoon(range.to));
  const [draft, setDraft] = useState<Date | null>(null);
  const cells = useMemo(() => monthGrid(view), [view]);
  const highlightFrom = draft ?? range.from;
  const highlightTo = draft ?? range.to;
  const title = view.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  function selectDay(day: Date) {
    const picked = clampDay(day, minDate, maxDate);
    if (!draft) {
      setDraft(picked);
      return;
    }
    const from = toIsoDate(draft) <= toIsoDate(picked) ? draft : picked;
    const to = toIsoDate(draft) <= toIsoDate(picked) ? picked : draft;
    onChange({ from: atNoon(from), to: atNoon(to) });
    setDraft(null);
  }

  const canPrev =
    new Date(view.getFullYear(), view.getMonth(), 1, 12) > atNoon(minDate);
  const canNext =
    new Date(view.getFullYear(), view.getMonth() + 1, 1, 12) <= atNoon(maxDate);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Предыдущий месяц"
          disabled={!canPrev}
          className="rounded-lg p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] disabled:opacity-30"
          onClick={() =>
            setView(new Date(view.getFullYear(), view.getMonth() - 1, 1, 12))
          }
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-medium capitalize">{title}</p>
        <button
          type="button"
          aria-label="Следующий месяц"
          disabled={!canNext}
          className="rounded-lg p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] disabled:opacity-30"
          onClick={() =>
            setView(new Date(view.getFullYear(), view.getMonth() + 1, 1, 12))
          }
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] text-[var(--muted-foreground)]">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const iso = toIsoDate(day);
          const disabled =
            iso < toIsoDate(minDate) || iso > toIsoDate(maxDate);
          const selectedStart = sameDay(day, highlightFrom);
          const selectedEnd = sameDay(day, highlightTo);
          const selected = selectedStart || selectedEnd;
          const mid = inRange(day, highlightFrom, highlightTo) && !selected;
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => selectDay(day)}
              className={cn(
                "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs tabular-nums",
                disabled && "opacity-30",
                mid && "bg-[var(--primary)]/15 text-[var(--foreground)]",
                selected &&
                  "bg-[var(--primary)] text-[var(--primary-foreground)]",
                !selected &&
                  !mid &&
                  !disabled &&
                  "hover:bg-[var(--muted)]",
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-[var(--muted-foreground)]">
        {draft
          ? "Выберите конечную дату"
          : `${toIsoDate(range.from)} — ${toIsoDate(range.to)}`}
      </p>
    </div>
  );
}
