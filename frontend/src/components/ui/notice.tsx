import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface NoticeProps {
  children: ReactNode;
  className?: string;
  variant?: "warning" | "info";
}

export function Notice({
  children,
  className,
  variant = "warning",
}: NoticeProps) {
  return (
    <div
      role="status"
      className={cn(
        "mb-4 rounded-lg border px-4 py-3 text-sm",
        variant === "warning"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200"
          : "border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
