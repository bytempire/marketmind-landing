"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useOzonAutoSync } from "@/components/ozon-sync-controls";
import { PageHeader } from "@/components/query-state";
import { Notice } from "@/components/ui/notice";
import { useCabinet } from "@/lib/marketplace-cabinet";
import { cn } from "@/lib/utils";

const SUBTABS = [
  { href: "/commerce/economics", label: "Обзор" },
  { href: "/commerce/economics/pricing", label: "Калькулятор" },
  { href: "/commerce/economics/expenses", label: "Свои расходы" },
] as const;

export default function EconomicsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { selected } = useCabinet();
  const isWbOnly = selected?.type === "wb";
  useOzonAutoSync("commerce");

  return (
    <div>
      <PageHeader
        title="Экономика"
        description="Юнит-экономика кабинета: Ozon, себестоимость и свои расходы"
      />
      {isWbOnly ? (
        <Notice className="mb-4">
          Коммерческая аналитика доступна только для Ozon. Выберите кабинет Ozon
          в селекторе слева.
        </Notice>
      ) : (
        <nav className="mb-6 flex gap-1">
          {SUBTABS.map((tab) => {
            const active =
              tab.href === "/commerce/economics"
                ? pathname === tab.href
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm",
                  active
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      )}
      {isWbOnly ? null : children}
    </div>
  );
}
