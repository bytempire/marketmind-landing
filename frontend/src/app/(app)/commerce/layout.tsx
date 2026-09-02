"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/commerce/sales", label: "Продажи" },
  { href: "/commerce/stocks", label: "Остатки" },
  { href: "/commerce/expiration", label: "Сроки годности" },
  { href: "/commerce/storage", label: "Хранение" },
  { href: "/commerce/content", label: "Контент" },
  { href: "/commerce/economics", label: "Экономика" },
] as const;

export default function CommerceLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <nav className="mb-6 flex flex-wrap gap-1 border-b border-[var(--border)]">
        {TABS.map((t) => {
          const active =
            pathname === t.href || pathname.startsWith(`${t.href}/`);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 text-sm",
                active
                  ? "border-[var(--primary)] font-medium"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
