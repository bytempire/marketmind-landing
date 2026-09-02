"use client";

import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { apiFetch } from "@/lib/api";
import type { Marketplace } from "@/lib/types";

const STORAGE_KEY = "mm.cabinetId";

type CabinetContextValue = {
  marketplaceId: string | null;
  setMarketplaceId: (id: string | null) => void;
  marketplaces: Marketplace[];
  selected: Marketplace | null;
  isLoading: boolean;
};

const CabinetContext = createContext<CabinetContextValue | null>(null);

export function MarketplaceCabinetProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["marketplaces"],
    queryFn: () => apiFetch<Marketplace[]>("/marketplaces"),
  });
  const marketplaces = useMemo(
    () => (data ?? []).filter((m) => m.is_active),
    [data],
  );

  const [marketplaceId, setMarketplaceIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setMarketplaceIdState(stored && stored.length > 0 ? stored : null);
    } catch {
      setMarketplaceIdState(null);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || isLoading) return;
    const valid =
      marketplaceId && marketplaces.some((m) => m.id === marketplaceId);
    if (valid) return;
    const next = marketplaces[0]?.id ?? null;
    setMarketplaceIdState(next);
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, next);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [hydrated, isLoading, marketplaceId, marketplaces]);

  function setMarketplaceId(id: string | null) {
    setMarketplaceIdState(id);
    try {
      if (id) window.localStorage.setItem(STORAGE_KEY, id);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  const selected =
    marketplaces.find((m) => m.id === marketplaceId) ?? null;

  const value = useMemo(
    () => ({
      marketplaceId,
      setMarketplaceId,
      marketplaces,
      selected,
      isLoading,
    }),
    [marketplaceId, marketplaces, selected, isLoading],
  );

  return (
    <CabinetContext.Provider value={value}>{children}</CabinetContext.Provider>
  );
}

export function useCabinet(): CabinetContextValue {
  const ctx = useContext(CabinetContext);
  if (!ctx) {
    throw new Error("useCabinet must be used within MarketplaceCabinetProvider");
  }
  return ctx;
}

export function cabinetLabel(m: Marketplace): string {
  const type = m.type === "wb" ? "WB" : "Ozon";
  const name = m.name?.trim();
  return name ? `${type} · ${name}` : type;
}
