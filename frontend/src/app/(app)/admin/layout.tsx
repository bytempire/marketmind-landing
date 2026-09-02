"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/query-state";
import { useCurrentUser } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/subscriptions", label: "Подписки" },
  { href: "/admin/payments", label: "Платежи" },
  { href: "/admin/ai", label: "ИИ" },
  { href: "/admin/logs", label: "Логи" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <p className="text-sm text-[var(--muted-foreground)]">Загрузка…</p>;
  }

  if (user?.role !== "admin") {
    return (
      <div>
        <PageHeader title="Админ-панель" />
        <p className="text-sm text-[var(--destructive)]">
          Доступ только для администраторов
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Админ-панель" description="Управление и метрики сервиса" />
      <nav className="mb-6 flex gap-1 border-b border-[var(--border)]">
        {TABS.map((t) => {
          const active = pathname === t.href;
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
