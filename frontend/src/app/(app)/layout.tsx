"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { ApiError } from "@/lib/api";
import { useCurrentUser } from "@/lib/hooks";
import { MarketplaceCabinetProvider } from "@/lib/marketplace-cabinet";

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoading, error } = useCurrentUser();

  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) {
      router.replace("/login");
    }
  }, [error, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--muted-foreground)]">
        Загрузка…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--muted-foreground)]">
        Перенаправление на вход…
      </div>
    );
  }

  return (
    <MarketplaceCabinetProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-6 pb-24 md:pb-6">{children}</main>
        </div>
      </div>
    </MarketplaceCabinetProvider>
  );
}
