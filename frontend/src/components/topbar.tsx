"use client";

import { LogOut } from "lucide-react";

import { CabinetSelector } from "@/components/cabinet-selector";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useCurrentUser } from "@/lib/hooks";

export function Topbar() {
  const { data: user } = useCurrentUser();

  async function logout() {
    await apiFetch("/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header className="flex h-14 items-center gap-2 border-b border-[var(--border)] px-3 sm:gap-3 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <MobileNav />
        <CabinetSelector className="min-w-0 flex-1 md:hidden" compact />
        <div className="hidden min-w-0 truncate text-sm text-[var(--muted-foreground)] md:block">
          {user?.name ?? user?.email ?? ""}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Выйти" onClick={logout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
