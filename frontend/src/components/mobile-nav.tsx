"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/hooks";
import { getAppNavItems, isNavItemActive, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

const BOTTOM_HREFS = [
  "/dashboard",
  "/reviews",
  "/questions",
  "/analytics",
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const reduceMotion = useReducedMotion();
  const items = getAppNavItems(user?.role);
  const bottomItems = BOTTOM_HREFS.map(
    (href) => items.find((item) => item.href === href),
  ).filter((item): item is NavItem => Boolean(item));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const drawer =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-[100] md:hidden">
            <motion.button
              type="button"
              aria-label="Закрыть меню"
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              id="mobile-nav-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col border-r border-[var(--border)] bg-[var(--background)] p-4 shadow-xl"
              initial={reduceMotion ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={reduceMotion ? undefined : { x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
            >
              <div className="mb-6 flex items-center justify-between gap-3 px-2">
                <div id={titleId} className="text-lg font-bold">
                  MarketMind AI
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Закрыть меню"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pb-8">
                {items.map(({ href, label, icon: Icon }) => {
                  const active = isNavItemActive(pathname, href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        active
                          ? "bg-[var(--muted)] font-medium"
                          : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>,
      document.body,
    );

  return (
    <>
      <div className="shrink-0 md:hidden">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <nav
        aria-label="Основная навигация"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--background)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <div className="grid grid-cols-5">
          {bottomItems.map(({ href, label, icon: Icon }) => {
            const active = isNavItemActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 px-1 py-2 text-[10px] transition-colors",
                  active
                    ? "text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)]",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            aria-label="Все разделы"
            aria-expanded={open}
            className={cn(
              "flex flex-col items-center gap-1 px-1 py-2 text-[10px] transition-colors",
              open
                ? "text-[var(--foreground)]"
                : "text-[var(--muted-foreground)]",
            )}
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span>Ещё</span>
          </button>
        </div>
      </nav>

      {drawer}
    </>
  );
}
