import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";

export function MarketingStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-sm text-[var(--muted-foreground)]">{label}</div>
        <div className="mt-2 text-2xl font-semibold">{value}</div>
        <p className="mt-2 text-xs leading-snug text-[var(--muted-foreground)]">
          {hint}
        </p>
      </CardContent>
    </Card>
  );
}

export function MarketingSection({
  title,
  why,
  children,
}: {
  title: string;
  why: string;
  children: ReactNode;
}) {
  return (
    <Card className="mb-6">
      <CardHeader className="space-y-1">
        <CardTitle>{title}</CardTitle>
        <p className="text-sm font-normal text-[var(--muted-foreground)]">
          {why}
        </p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
