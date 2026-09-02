import { Card, CardContent } from "@/components/ui/card";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function formatMoney(value: string | number | null | undefined): string {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function moneyTone(value: string | number | null | undefined): string {
  const n = Number(value ?? 0);
  if (n > 0) return "text-emerald-600 dark:text-emerald-400";
  if (n < 0) return "text-[var(--destructive)]";
  return "";
}

export function HintLabel({
  children,
  hint,
  className,
}: {
  children: ReactNode;
  hint: string;
  className?: string;
}) {
  return (
    <span
      title={hint}
      className={cn(
        "cursor-help border-b border-dotted border-[var(--muted-foreground)]/60",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function CommerceStat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "up" | "down" | "neutral";
}) {
  const valueClass =
    tone === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "down"
        ? "text-[var(--destructive)]"
        : "";
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-sm text-[var(--muted-foreground)]">
          {hint ? <HintLabel hint={hint}>{label}</HintLabel> : label}
        </div>
        <div className={`mt-2 text-2xl font-semibold ${valueClass}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

export function priceIndexVariant(
  code: string | null | undefined,
): "success" | "warning" | "destructive" | "secondary" {
  const c = (code ?? "").toUpperCase();
  if (c.includes("RED") || c.includes("CRITICAL")) return "destructive";
  if (c.includes("YELLOW")) return "warning";
  if (c.includes("GREEN") || c === "SUPER" || c.includes("SUPER")) {
    return "success";
  }
  return "secondary";
}

export function healthStatusVariant(
  status: string | null | undefined,
): "success" | "warning" | "destructive" | "secondary" {
  const s = (status ?? "").toUpperCase();
  if (s === "OK" || s === "SUCCESS" || s === "GREEN") return "success";
  if (s === "CRITICAL" || s === "DANGER") return "destructive";
  if (s === "WARNING") return "warning";
  return "secondary";
}
