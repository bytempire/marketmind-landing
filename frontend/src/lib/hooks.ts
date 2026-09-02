"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { useCabinet } from "@/lib/marketplace-cabinet";
import { OZON_LIVE_REFRESH_MS } from "@/lib/ozon-limits";
import type {
  AdminAuditLog,
  AdminPayment,
  AdminStats,
  AdminSubscription,
  AdminUser,
  Answer,
  BriefingResponse,
  CabinetHealthResponse,
  CommerceSummary,
  ContentItem,
  Dashboard,
  EconomicsResponse,
  ExpenseCatalogResponse,
  ExpenseItemPublic,
  ExpenseItemWrite,
  ExpensePresetsResponse,
  ExpenseProfilePublic,
  ExpenseProfileUpdate,
  ApplyExpensePresetRequest,
  ExpirationResponse,
  HealthScore,
  Insight,
  InsightsSettings,
  InsightsGenerateResult,
  Marketplace,
  MarketplaceType,
  NotificationSettings,
  OosItem,
  OpenRouterCost,
  TurnoverItem,
  PlacementResponse,
  PainStat,
  PlanType,
  Product,
  Question,
  Review,
  PricingInputs,
  PricingListResponse,
  PricingRow,
  SalesResponse,
  SkuGroupsResponse,
  SkuEconomicsRow,
  SkuExpenseOverride,
  SkusResponse,
  StocksResponse,
  SubscriptionInfo,
  TelegramLink,
  User,
  MarketingSummary,
  MarketingSeriesResponse,
  CampaignsResponse,
  ActionsResponse,
  AutoAddProductsDeleteResponse,
  AutoAddProductsResponse,
  AutoAddProductRef,
  DiscountTaskDecideResponse,
  DiscountTasksResponse,
  SyncTaskAccepted,
  OrganizationOverview,
  OrganizationInvitePublic,
  InvitePreview,
  Task,
  TaskComment,
  OrgMemberRole,
  TaskStatus,
  TaskPriority,
  TaskSourceType,
} from "@/lib/types";

function withCabinet(
  path: string,
  marketplaceId: string | null,
  extra?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  if (marketplaceId) params.set("marketplace_id", marketplaceId);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<User>("/auth/me"),
    retry: false,
  });
}

export function useDashboard() {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["dashboard", marketplaceId],
    queryFn: () =>
      apiFetch<Dashboard>(withCabinet("/dashboard", marketplaceId)),
  });
}

export function usePains() {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["pains", marketplaceId],
    queryFn: () =>
      apiFetch<PainStat[]>(withCabinet("/analytics/pains", marketplaceId)),
  });
}

export function useHealth() {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["health", marketplaceId],
    queryFn: () =>
      apiFetch<HealthScore[]>(
        withCabinet("/analytics/health", marketplaceId),
      ),
  });
}

export function useProducts() {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["products", marketplaceId],
    queryFn: () =>
      apiFetch<Product[]>(withCabinet("/products", marketplaceId)),
  });
}

export function useInsights() {
  return useQuery({
    queryKey: ["insights"],
    queryFn: () => apiFetch<Insight[]>("/analytics/insights"),
  });
}

export function useInsightsSettings() {
  return useQuery({
    queryKey: ["insights", "settings"],
    queryFn: () => apiFetch<InsightsSettings>("/analytics/insights/settings"),
  });
}

export function useUpdateInsightsSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enabled: boolean) =>
      apiFetch<InsightsSettings>("/analytics/insights/settings", {
        method: "PUT",
        body: { enabled },
      }),
    onSuccess: (data) =>
      qc.setQueryData(["insights", "settings"], data),
  });
}

export function useGenerateInsights() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<InsightsGenerateResult>("/analytics/insights/generate", {
        method: "POST",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insights"] }),
  });
}

export function useReviews() {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["reviews", marketplaceId],
    queryFn: () =>
      apiFetch<Review[]>(withCabinet("/reviews", marketplaceId)),
  });
}

export function useQuestions() {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["questions", marketplaceId],
    queryFn: () =>
      apiFetch<Question[]>(withCabinet("/questions", marketplaceId)),
  });
}

export function useMarketplaces() {
  return useQuery({
    queryKey: ["marketplaces"],
    queryFn: () => apiFetch<Marketplace[]>("/marketplaces"),
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: () => apiFetch<SubscriptionInfo>("/billing/subscription"),
  });
}

export function useCheckout() {
  return useMutation({
    mutationFn: (payload: { months: 1 | 6 | 12; plan: PlanType }) =>
      apiFetch<{
        payment_id: string;
        payment_url: string;
        amount_rub: number;
        months: number;
        order_id: string;
      }>("/billing/checkout", {
        method: "POST",
        body: payload,
      }),
  });
}

export function useCreateMarketplace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      type: MarketplaceType;
      name: string | null;
      api_token: string;
      performance_token?: string;
    }) => apiFetch<Marketplace>("/marketplaces", { method: "POST", body: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["marketplaces"] }),
  });
}

export function useDeleteMarketplace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/marketplaces/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["marketplaces"] }),
  });
}

export function useSyncMarketplace() {
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ status: string }>(`/marketplaces/${id}/sync`, {
        method: "POST",
      }),
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: ["notifications", "settings"],
    queryFn: () => apiFetch<NotificationSettings>("/notifications/settings"),
  });
}

export function useUpdateNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      notify_negative: boolean;
      notify_limit: boolean;
      notify_commerce: boolean;
    }) =>
      apiFetch<NotificationSettings>("/notifications/settings", {
        method: "PUT",
        body: payload,
      }),
    onSuccess: (data) =>
      qc.setQueryData(["notifications", "settings"], data),
  });
}

export function useTelegramLink() {
  return useMutation({
    mutationFn: () =>
      apiFetch<TelegramLink>("/notifications/telegram/link", {
        method: "POST",
      }),
  });
}

export function useTelegramUnlink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<void>("/notifications/telegram", { method: "DELETE" }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["notifications", "settings"] }),
  });
}

export function useReplyReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      apiFetch<Answer>(`/reviews/${id}/reply`, { method: "POST", body: { text } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => apiFetch<AdminStats>("/admin/stats"),
  });
}

export function useAdminOpenRouter() {
  return useQuery({
    queryKey: ["admin", "openrouter"],
    queryFn: () => apiFetch<OpenRouterCost>("/admin/openrouter"),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => apiFetch<AdminUser[]>("/admin/users"),
  });
}

export function useAdminSubscriptions() {
  return useQuery({
    queryKey: ["admin", "subscriptions"],
    queryFn: () => apiFetch<AdminSubscription[]>("/admin/subscriptions"),
  });
}

export function useAdminPayments() {
  return useQuery({
    queryKey: ["admin", "payments"],
    queryFn: () => apiFetch<AdminPayment[]>("/admin/payments"),
  });
}

export function useAdminLogs() {
  return useQuery({
    queryKey: ["admin", "logs"],
    queryFn: () => apiFetch<AdminAuditLog[]>("/admin/logs"),
  });
}

export function useChangePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      plan,
      months,
    }: {
      userId: string;
      plan: PlanType;
      months?: number;
    }) =>
      apiFetch<AdminSubscription>(`/admin/subscriptions/${userId}/plan`, {
        method: "POST",
        body: months === undefined ? { plan } : { plan, months },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "payments"] });
    },
  });
}

export function useReplyQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      apiFetch<Answer>(`/questions/${id}/reply`, {
        method: "POST",
        body: { text },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questions"] }),
  });
}

export function useCommerceSummary() {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["commerce", "summary", marketplaceId],
    queryFn: () =>
      apiFetch<CommerceSummary>(
        withCabinet("/commerce/summary", marketplaceId),
      ),
  });
}

export function useCommerceBriefing() {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["commerce", "briefing", marketplaceId],
    queryFn: () =>
      apiFetch<BriefingResponse>(
        withCabinet("/commerce/briefing", marketplaceId),
      ),
  });
}

export function useCommerceSales(
  dateFrom?: string,
  dateTo?: string,
  enabled = true,
) {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: [
      "commerce",
      "sales",
      marketplaceId,
      dateFrom ?? null,
      dateTo ?? null,
    ],
    queryFn: () =>
      apiFetch<SalesResponse>(
        withCabinet("/commerce/sales", marketplaceId, {
          date_from: dateFrom,
          date_to: dateTo,
        }),
      ),
    enabled,
  });
}

export function useCommerceOos() {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["commerce", "oos", marketplaceId],
    queryFn: () =>
      apiFetch<OosItem[]>(withCabinet("/commerce/oos", marketplaceId)),
  });
}

export function useCommerceTurnover() {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["commerce", "turnover", marketplaceId],
    queryFn: () =>
      apiFetch<TurnoverItem[]>(
        withCabinet("/commerce/turnover", marketplaceId),
      ),
  });
}

export function useCommerceStocks() {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["commerce", "stocks", marketplaceId],
    queryFn: () =>
      apiFetch<StocksResponse>(
        withCabinet("/commerce/stocks", marketplaceId),
      ),
  });
}

export function useCommerceExpiration() {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["commerce", "expiration", marketplaceId],
    queryFn: () =>
      apiFetch<ExpirationResponse>(
        withCabinet("/commerce/expiration", marketplaceId),
      ),
  });
}

export function useCommercePlacement() {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["commerce", "placement", marketplaceId],
    queryFn: () =>
      apiFetch<PlacementResponse>(
        withCabinet("/commerce/placement", marketplaceId),
      ),
  });
}

export function useCommerceContent() {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["commerce", "content", marketplaceId],
    queryFn: () =>
      apiFetch<ContentItem[]>(
        withCabinet("/commerce/content", marketplaceId),
      ),
  });
}

export function useCommerceEconomics(dateFrom?: string, dateTo?: string) {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["commerce", "economics", marketplaceId, dateFrom ?? null, dateTo ?? null],
    queryFn: () =>
      apiFetch<EconomicsResponse>(
        withCabinet("/commerce/economics", marketplaceId, {
          date_from: dateFrom,
          date_to: dateTo,
        }),
      ),
  });
}

export function useExpenseCatalog() {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["commerce", "expenses", marketplaceId],
    queryFn: () =>
      apiFetch<ExpenseCatalogResponse>(
        withCabinet("/commerce/expenses", marketplaceId),
      ),
    enabled: Boolean(marketplaceId),
  });
}

export function useUpdateExpenseProfile() {
  const qc = useQueryClient();
  const { marketplaceId } = useCabinet();
  return useMutation({
    mutationFn: (payload: ExpenseProfileUpdate) =>
      apiFetch<ExpenseProfilePublic>(
        withCabinet("/commerce/expenses/profile", marketplaceId),
        { method: "PATCH", body: payload },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["commerce", "economics"] });
      void qc.invalidateQueries({ queryKey: ["commerce", "expenses"] });
    },
  });
}

export function useCreateExpenseItem() {
  const qc = useQueryClient();
  const { marketplaceId } = useCabinet();
  return useMutation({
    mutationFn: (payload: ExpenseItemWrite) =>
      apiFetch<ExpenseItemPublic>(
        withCabinet("/commerce/expenses", marketplaceId),
        { method: "POST", body: payload },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["commerce", "economics"] });
      void qc.invalidateQueries({ queryKey: ["commerce", "expenses"] });
    },
  });
}

export function usePatchExpenseItem() {
  const qc = useQueryClient();
  const { marketplaceId } = useCabinet();
  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: Partial<ExpenseItemWrite>;
    }) =>
      apiFetch<ExpenseItemPublic>(
        withCabinet(`/commerce/expenses/${itemId}`, marketplaceId),
        { method: "PATCH", body: payload },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["commerce", "economics"] });
      void qc.invalidateQueries({ queryKey: ["commerce", "expenses"] });
    },
  });
}

export function useDeleteExpenseItem() {
  const qc = useQueryClient();
  const { marketplaceId } = useCabinet();
  return useMutation({
    mutationFn: (itemId: string) =>
      apiFetch<void>(
        withCabinet(`/commerce/expenses/${itemId}`, marketplaceId),
        { method: "DELETE" },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["commerce", "economics"] });
      void qc.invalidateQueries({ queryKey: ["commerce", "expenses"] });
    },
  });
}

export function useExpensePresets() {
  return useQuery({
    queryKey: ["commerce", "expense-presets"],
    queryFn: () => apiFetch<ExpensePresetsResponse>("/commerce/expenses/presets"),
  });
}

export function useApplyExpensePreset() {
  const qc = useQueryClient();
  const { marketplaceId } = useCabinet();
  return useMutation({
    mutationFn: (payload: ApplyExpensePresetRequest) =>
      apiFetch<ExpenseCatalogResponse>(
        withCabinet("/commerce/expenses/preset", marketplaceId),
        { method: "POST", body: payload },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["commerce", "economics"] });
      void qc.invalidateQueries({ queryKey: ["commerce", "expenses"] });
    },
  });
}

export function usePatchProductCost() {
  const qc = useQueryClient();
  const { marketplaceId } = useCabinet();
  return useMutation({
    mutationFn: ({
      productId,
      amount,
    }: {
      productId: string;
      amount: string;
    }) =>
      apiFetch<SkuEconomicsRow>(
        withCabinet(`/commerce/costs/${productId}`, marketplaceId),
        { method: "PATCH", body: { amount } },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["commerce", "economics"] });
    },
  });
}

export function usePatchSkuExpense() {
  const qc = useQueryClient();
  const { marketplaceId } = useCabinet();
  return useMutation({
    mutationFn: ({
      productId,
      values,
    }: {
      productId: string;
      values: Partial<SkuExpenseOverride>;
    }) =>
      apiFetch<SkuExpenseOverride>(
        withCabinet(`/commerce/sku-expenses/${productId}`, marketplaceId),
        { method: "PATCH", body: values },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["commerce", "economics"] });
    },
  });
}

export function usePricing() {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["commerce", "pricing", marketplaceId],
    queryFn: () =>
      apiFetch<PricingListResponse>(
        withCabinet("/commerce/pricing", marketplaceId),
      ),
  });
}

export function useSavePricing() {
  const { marketplaceId } = useCabinet();
  return useMutation({
    mutationFn: ({
      productId,
      inputs,
    }: {
      productId: string;
      inputs: PricingInputs;
    }) =>
      apiFetch<PricingRow>(
        withCabinet(`/commerce/pricing/${productId}`, marketplaceId),
        { method: "PATCH", body: inputs },
      ),
  });
}

export function useCommerceCabinetHealth() {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["commerce", "cabinet-health", marketplaceId],
    queryFn: () =>
      apiFetch<CabinetHealthResponse>(
        withCabinet("/commerce/cabinet-health", marketplaceId),
      ),
  });
}

export function useCommerceSync() {
  const qc = useQueryClient();
  const { marketplaceId, selected } = useCabinet();
  return useMutation({
    mutationFn: () => {
      if (selected?.type === "wb") {
        return Promise.reject(new Error("Коммерция доступна только для Ozon"));
      }
      return apiFetch<SyncTaskAccepted>(
        withCabinet("/commerce/sync", marketplaceId),
        { method: "POST" },
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["commerce"] });
      window.setTimeout(() => {
        void qc.invalidateQueries({ queryKey: ["commerce"] });
      }, 8000);
      window.setTimeout(() => {
        void qc.invalidateQueries({ queryKey: ["commerce"] });
      }, 30000);
    },
  });
}

export function useMarketingSummary(dateFrom?: string, dateTo?: string) {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["marketing", "summary", marketplaceId, dateFrom ?? null, dateTo ?? null],
    queryFn: () =>
      apiFetch<MarketingSummary>(
        withCabinet("/marketing/summary", marketplaceId, {
          date_from: dateFrom,
          date_to: dateTo,
        }),
      ),
  });
}

export function useMarketingSeries(dateFrom?: string, dateTo?: string) {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["marketing", "series", marketplaceId, dateFrom ?? null, dateTo ?? null],
    queryFn: () =>
      apiFetch<MarketingSeriesResponse>(
        withCabinet("/marketing/series", marketplaceId, {
          date_from: dateFrom,
          date_to: dateTo,
        }),
      ),
  });
}

export function useMarketingCampaigns(dateFrom?: string, dateTo?: string) {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: [
      "marketing",
      "campaigns",
      marketplaceId,
      dateFrom ?? null,
      dateTo ?? null,
    ],
    queryFn: () =>
      apiFetch<CampaignsResponse>(
        withCabinet("/marketing/campaigns", marketplaceId, {
          date_from: dateFrom,
          date_to: dateTo,
        }),
      ),
  });
}

export function useMarketingSkus(dateFrom?: string, dateTo?: string) {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["marketing", "skus", marketplaceId, dateFrom ?? null, dateTo ?? null],
    queryFn: () =>
      apiFetch<SkusResponse>(
        withCabinet("/marketing/skus", marketplaceId, {
          date_from: dateFrom,
          date_to: dateTo,
        }),
      ),
  });
}

export function useMarketingSkuGroups(dateFrom?: string, dateTo?: string) {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: [
      "marketing",
      "sku-groups",
      marketplaceId,
      dateFrom ?? null,
      dateTo ?? null,
    ],
    queryFn: () =>
      apiFetch<SkuGroupsResponse>(
        withCabinet("/marketing/sku-groups", marketplaceId, {
          date_from: dateFrom,
          date_to: dateTo,
        }),
      ),
  });
}

export function useMarketingActions(participatingOnly = false) {
  const { marketplaceId } = useCabinet();
  return useQuery({
    queryKey: ["marketing", "actions", marketplaceId, participatingOnly],
    queryFn: () =>
      apiFetch<ActionsResponse>(
        withCabinet("/marketing/actions", marketplaceId, {
          participating_only: participatingOnly ? "true" : undefined,
        }),
      ),
  });
}

export function useMarketingSync() {
  const qc = useQueryClient();
  const { marketplaceId, selected } = useCabinet();
  return useMutation({
    mutationFn: () => {
      if (selected?.type === "wb") {
        return Promise.reject(new Error("Маркетинг доступен только для Ozon"));
      }
      return apiFetch<SyncTaskAccepted>(
        withCabinet("/marketing/sync", marketplaceId),
        { method: "POST" },
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["marketing"] });
      window.setTimeout(() => {
        void qc.invalidateQueries({ queryKey: ["marketing"] });
      }, 15000);
      window.setTimeout(() => {
        void qc.invalidateQueries({ queryKey: ["marketing"] });
      }, 60000);
    },
  });
}

export function useSetPerformanceToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      marketplaceId,
      performance_token,
    }: {
      marketplaceId: string;
      performance_token: string;
    }) =>
      apiFetch<Marketplace>(
        `/marketplaces/${marketplaceId}/performance-token`,
        {
          method: "PUT",
          body: { performance_token },
        },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["marketplaces"] });
      void qc.invalidateQueries({ queryKey: ["marketing"] });
    },
  });
}

export function useDiscountTasks() {
  const { marketplaceId, selected } = useCabinet();
  return useQuery({
    queryKey: ["marketing", "discount-tasks", marketplaceId],
    enabled: selected?.type === "ozon" && Boolean(marketplaceId),
    refetchInterval: OZON_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
    queryFn: () =>
      apiFetch<DiscountTasksResponse>(
        withCabinet("/marketing/discount-tasks", marketplaceId),
      ),
  });
}

export function useDiscountTaskDecide() {
  const qc = useQueryClient();
  const { marketplaceId, selected } = useCabinet();
  return useMutation({
    mutationFn: ({
      action,
      bucket,
      ids,
    }: {
      action: "approve" | "decline";
      bucket?: "lte" | "gt";
      ids?: number[];
    }) => {
      if (selected?.type === "wb") {
        return Promise.reject(new Error("Заявки на скидку доступны только для Ozon"));
      }
      return apiFetch<DiscountTaskDecideResponse>(
        withCabinet(`/marketing/discount-tasks/${action}`, marketplaceId),
        { method: "POST", body: { bucket, ids: ids ?? [] } },
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["marketing", "discount-tasks"] });
    },
  });
}

export function useAutoAddProducts() {
  const { marketplaceId, selected } = useCabinet();
  return useQuery({
    queryKey: ["marketing", "auto-add-products", marketplaceId],
    enabled: selected?.type === "ozon" && Boolean(marketplaceId),
    refetchInterval: OZON_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
    queryFn: () =>
      apiFetch<AutoAddProductsResponse>(
        withCabinet("/marketing/auto-add-products", marketplaceId),
      ),
  });
}

export function useDeleteAutoAddProducts() {
  const qc = useQueryClient();
  const { marketplaceId, selected } = useCabinet();
  return useMutation({
    mutationFn: (items: AutoAddProductRef[]) => {
      if (selected?.type === "wb") {
        return Promise.reject(new Error("Автоакции доступны только для Ozon"));
      }
      return apiFetch<AutoAddProductsDeleteResponse>(
        withCabinet("/marketing/auto-add-products/delete", marketplaceId),
        { method: "POST", body: { items } },
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["marketing", "auto-add-products"] });
    },
  });
}

export function useOrganization() {
  return useQuery({
    queryKey: ["organization"],
    queryFn: () => apiFetch<OrganizationOverview>("/organization"),
  });
}

export function useCreateInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email: string) =>
      apiFetch<OrganizationInvitePublic>("/organization/invites", {
        method: "POST",
        body: { email },
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

export function useRevokeInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) =>
      apiFetch(`/organization/invites/${inviteId}`, { method: "DELETE" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiFetch(`/organization/members/${userId}`, { method: "DELETE" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

export function useInvitePreview(token: string) {
  return useQuery({
    queryKey: ["invite", token],
    queryFn: () =>
      apiFetch<InvitePreview>(`/organization/invites/preview/${token}`),
    enabled: Boolean(token),
  });
}

export function useAcceptInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) =>
      apiFetch("/organization/invites/accept", {
        method: "POST",
        body: { token },
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["organization"] });
      void qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useTasks(status?: TaskStatus) {
  return useQuery({
    queryKey: ["tasks", status],
    queryFn: () => {
      const params = status ? `?status=${status}` : "";
      return apiFetch<Task[]>(`/tasks${params}`);
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      title: string;
      description?: string;
      priority?: TaskPriority;
      assignee_id?: string;
      source_type?: TaskSourceType;
      source_ref?: Record<string, unknown>;
      marketplace_id?: string;
    }) =>
      apiFetch<Task>("/tasks", { method: "POST", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      ...body
    }: {
      taskId: string;
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assignee_id?: string | null;
    }) =>
      apiFetch<Task>(`/tasks/${taskId}`, { method: "PATCH", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useTaskComments(taskId: string | null) {
  return useQuery({
    queryKey: ["tasks", taskId, "comments"],
    queryFn: () => apiFetch<TaskComment[]>(`/tasks/${taskId}/comments`),
    enabled: Boolean(taskId),
  });
}

export function useAddTaskComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      apiFetch<TaskComment>(`/tasks/${taskId}/comments`, {
        method: "POST",
        body: { body },
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["tasks", taskId, "comments"] });
      void qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
