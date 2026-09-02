"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useCommerceSync, useMarketingSync } from "@/lib/hooks";
import { useCabinet } from "@/lib/marketplace-cabinet";
import {
  LOCAL_DATA_POLL_MS,
  OZON_SYNC_FALLBACK_INTERVAL_SEC,
} from "@/lib/ozon-limits";
import type { SyncTaskAccepted } from "@/lib/types";

type SyncKind = "commerce" | "marketing";

const MARKETING_DB_KEYS = [
  ["marketing", "summary"],
  ["marketing", "series"],
  ["marketing", "campaigns"],
  ["marketing", "skus"],
  ["marketing", "sku-groups"],
  ["marketing", "actions"],
] as const;

function pollKeys(kind: SyncKind): ReadonlyArray<readonly string[]> {
  if (kind === "commerce") return [["commerce"]];
  return MARKETING_DB_KEYS;
}

export function useOzonAutoSync(kind: SyncKind): void {
  const commerce = useCommerceSync();
  const marketing = useMarketingSync();
  const { selected, marketplaces, isLoading, marketplaceId } = useCabinet();
  const qc = useQueryClient();
  const hasOzon = marketplaces.some((m) => m.type === "ozon");
  const enabled = !isLoading && hasOzon && selected?.type !== "wb";
  const mutateAsync =
    kind === "commerce" ? commerce.mutateAsync : marketing.mutateAsync;
  const mutateAsyncRef = useRef(mutateAsync);
  mutateAsyncRef.current = mutateAsync;

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let retryTimer: number | undefined;
    let pollTimer: number | undefined;

    const invalidateLocal = () => {
      if (document.visibilityState !== "visible") return;
      for (const key of pollKeys(kind)) {
        void qc.invalidateQueries({ queryKey: [...key] });
      }
    };

    const waitThenTick = (seconds: number) => {
      window.clearTimeout(retryTimer);
      const delay = Math.max(seconds, 30) * 1000;
      retryTimer = window.setTimeout(() => {
        if (cancelled) return;
        if (document.visibilityState === "visible") {
          void tick();
        } else {
          waitThenTick(30);
        }
      }, delay);
    };

    async function tick() {
      if (cancelled) return;
      try {
        const result = (await mutateAsyncRef.current()) as SyncTaskAccepted;
        if (cancelled) return;
        waitThenTick(
          result.retry_after_seconds ?? OZON_SYNC_FALLBACK_INTERVAL_SEC,
        );
      } catch {
        if (cancelled) return;
        waitThenTick(60);
      }
    }

    void tick();
    pollTimer = window.setInterval(invalidateLocal, LOCAL_DATA_POLL_MS);

    const onVis = () => {
      if (document.visibilityState === "visible") invalidateLocal();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      window.clearTimeout(retryTimer);
      window.clearInterval(pollTimer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [enabled, kind, marketplaceId, qc]);
}
