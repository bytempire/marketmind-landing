"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CabinetSelector } from "@/components/cabinet-selector";
import { useCurrentUser } from "@/lib/hooks";
import { getAppNavItems, isNavItemActive } from "@/lib/nav";
import { cn } from "@/lib/utils";

const COLLAPSE_DELAY_MS = 120;

export function Sidebar() {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const items = getAppNavItems(user?.role);
  const [expanded, setExpanded] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  function expand() {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    setExpanded(true);
  }

  function collapse() {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => {
      setExpanded(false);
      leaveTimer.current = null;
    }, COLLAPSE_DELAY_MS);
  }

  return (
    <aside
      className={cn(
        "hidden shrink-0 overflow-hidden border-r border-[var(--border)] bg-[var(--background)] transition-[width] duration-200 ease-out md:block",
        expanded ? "w-60" : "w-16",
      )}
      onMouseEnter={expand}
      onMouseLeave={collapse}
      onFocusCapture={expand}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          collapse();
        }
      }}
    >
      <div
        className={cn(
          "flex h-full flex-col py-4",
          expanded ? "w-60 px-4" : "w-16 items-center px-2",
        )}
      >
        <div
          className={cn(
            "mb-6 font-bold",
            expanded ? "px-2 text-lg" : "text-sm",
          )}
        >
          {expanded ? "MarketMind AI" : "MM"}
        </div>
        {expanded ? <CabinetSelector className="mb-4 px-1" /> : null}
        <nav className="flex flex-col gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = isNavItemActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={cn(
                  "flex items-center rounded-lg py-2 text-sm transition-colors",
                  expanded ? "gap-3 px-3" : "justify-center px-2",
                  active
                    ? "bg-[var(--muted)] font-medium"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {expanded ? <span className="truncate">{label}</span> : (
                  <span className="sr-only">{label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
