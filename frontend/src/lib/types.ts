export type MarketplaceType = "ozon" | "wb";
export type UserRole = "user" | "admin";
export type OrgMemberRole =
  | "owner"
  | "admin"
  | "ops"
  | "marketing"
  | "finance"
  | "viewer";
export type TaskStatus = "open" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskSourceType = "manual" | "insight" | "oos" | "commerce_alert";
export type InviteStatus = "pending" | "accepted" | "revoked" | "expired";
export type AnswerStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "failed";
export type AnswerAuthor = "ai" | "human";
export type Sentiment = "positive" | "neutral" | "negative";
export type PlanType = "commerce" | "starter" | "business" | "pro";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
  timezone: string;
  auto_publish_threshold: number;
  ai_insights_enabled: boolean;
  created_at: string;
}

export interface Marketplace {
  id: string;
  type: MarketplaceType;
  name: string | null;
  api_token_last4: string | null;
  performance_token_last4: string | null;
  has_performance_token: boolean;
  is_active: boolean;
  last_sync: string | null;
  last_sync_status: string | null;
  last_sync_error: string | null;
  can_publish_replies: boolean;
  created_at: string;
}

export interface SyncTaskAccepted {
  status: string;
  item_id: string;
  retry_after_seconds?: number | null;
}

export interface Review {
  id: string;
  external_id: string;
  text: string | null;
  rating: number | null;
  author_name: string | null;
  status: AnswerStatus;
  created_at: string;
}

export interface Question {
  id: string;
  external_id: string;
  text: string;
  author_name: string | null;
  status: AnswerStatus;
  category: string | null;
  created_at: string;
}

export interface Answer {
  id: string;
  author: AnswerAuthor;
  text: string;
  confidence: number | null;
  status: AnswerStatus;
  model: string | null;
  published_at: string | null;
  created_at: string;
}

export interface PainStat {
  pain: string;
  label: string;
  count: number;
}

export interface DashboardCommerce {
  revenue_90d: string;
  ordered_units_90d: number;
  oos_count: number;
  oos_fbo_count: number;
  oos_fbs_count: number;
  oos_items: OosItem[];
  red_price_count: number;
  cabinet_status: string | null;
  approx_margin: string;
  commissions: string;
  logistics: string;
  storage: string;
  marketing_cost: string;
  other: string;
  fbo_units: number;
  fbs_units: number;
  expiring_units: number;
}

export interface DashboardMarketing {
  spend: string;
  drr: string | null;
  ctr: string | null;
  orders: number;
  campaigns_running: number;
  has_performance_token: boolean;
  period_from: string;
  period_to: string;
}

export interface DashboardWeakHealth {
  product_id: string;
  product_title: string | null;
  score: number;
}

export interface Dashboard {
  questions: number;
  reviews: number;
  negative: number;
  average_rating: number | null;
  pending_review: number;
  health_avg: number | null;
  top_pains: PainStat[];
  weak_health: DashboardWeakHealth[];
  sales_series: {
    date: string;
    revenue: string;
    ordered_units: number;
    delivered_units: number;
  }[];
  insights: {
    type: string;
    title: string;
    body: string;
    problem?: string | null;
    impact?: string | null;
    action?: string | null;
    priority?: number | null;
  }[];
  commerce: DashboardCommerce;
  marketing: DashboardMarketing;
}

export interface Product {
  id: string;
  marketplace_id: string;
  external_id: string;
  sku: string | null;
  title: string | null;
  brand: string | null;
  category: string | null;
  rating: number | null;
  reviews_count: number;
  created_at: string;
}

export interface HealthScore {
  product_id: string;
  product_title: string | null;
  score: number;
  negative: number;
  repeatability: number;
  risk: number;
  calculated_at: string;
}

export interface Insight {
  id: string;
  type: string;
  title: string;
  body: string;
  problem?: string | null;
  impact?: string | null;
  action?: string | null;
  priority?: number | null;
  created_at: string;
}

export interface InsightsSettings {
  enabled: boolean;
  available: boolean;
  plan: PlanType;
}

export interface InsightsGenerateResult {
  created: number;
  message: string;
}

export interface SubscriptionInfo {
  plan: PlanType;
  status: string;
  monthly_limit: number;
  used: number;
  remaining: number;
  current_period_end: string;
  paid_until: string | null;
}

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export interface OpenRouterModelCost {
  model: string;
  cost_usd: number;
  requests: number;
}

export interface OpenRouterUserCost {
  user_id: string | null;
  email: string | null;
  plan: PlanType | null;
  requests_month: number;
  cost_month_usd: number;
  requests_total: number;
  cost_total_usd: number;
}

export interface OpenRouterCost {
  total_usd: number;
  current_month_usd: number;
  by_model: OpenRouterModelCost[];
  by_user: OpenRouterUserCost[];
}

export interface AdminStats {
  users_total: number;
  active_subscriptions: number;
  paid_subscriptions: number;
  mrr_rub: number;
  churn_rate: number;
  openrouter_total_usd: number;
  openrouter_month_usd: number;
  failed_answers: number;
  sync_errors: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  is_active: boolean;
  plan: PlanType | null;
  created_at: string;
}

export interface AdminSubscription {
  id: string;
  user_id: string;
  user_email: string;
  plan: PlanType;
  status: string;
  monthly_limit: number;
  current_period_end: string;
  paid_until: string | null;
}

export interface AdminPayment {
  id: string;
  user_id: string;
  user_email: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string | null;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  ip: string | null;
  created_at: string;
}

export interface NotificationSettings {
  telegram_linked: boolean;
  notify_negative: boolean;
  notify_limit: boolean;
  notify_commerce: boolean;
}

export interface TelegramLink {
  code: string;
  deep_link: string;
  expires_in: number;
}

export interface CommerceSummary {
  revenue_90d: string;
  ordered_units_90d: number;
  oos_count: number;
  oos_fbo_count: number;
  oos_fbs_count: number;
  oos_items: OosItem[];
  red_price_count: number;
  cabinet_status: string | null;
  period_from: string;
  period_to: string;
}

export interface SalesPoint {
  date: string;
  revenue: string;
  ordered_units: number;
  delivered_units: number;
}

export interface TopSku {
  sku: string;
  title: string | null;
  revenue: string;
  ordered_units: number;
}

export interface SalesResponse {
  period_from: string;
  period_to: string;
  series: SalesPoint[];
  top_skus: TopSku[];
}

export interface OosItem {
  sku: string;
  product_id: string | null;
  title?: string | null;
  current_stock: number;
  fbo?: number;
  fbs?: number;
  in_transit?: number;
  available_fbo?: number;
  available_fbs?: number;
  ads: string | null;
  idc: string | null;
  turnover_grade: string | null;
  turnover_grade_label: string | null;
}

/** SKU → оборачиваемость в днях (IDC). */
export type TurnoverItem = OosItem;

export interface PlacementSkuItem {
  sku: string;
  title: string | null;
  units: number;
  paid_units: number;
  free_units: number;
  fee_amount: string;
  fee_period: string;
  days_until_paid: number | null;
  becomes_paid_on: string | null;
  warehouses: string[] | null;
  status: string;
  status_label: string;
  daily_rate: string;
  rate_estimated: boolean;
  forecast_daily: string[];
  forecast_total: string;
}

export interface PlacementSupplyItem {
  sku: string;
  title: string | null;
  supply_number: string;
  warehouse: string | null;
  days_until_paid: number | null;
  becomes_paid_on: string | null;
  category: string | null;
}

export interface PlacementResponse {
  paid: PlacementSkuItem[];
  soon: PlacementSkuItem[];
  supplies: PlacementSupplyItem[];
  paid_sku_count: number;
  soon_sku_count: number;
  fee_today: string;
  fee_period: string;
  forecast_dates: string[];
  forecast_by_day: string[];
  forecast_total: string;
  captured_at: string | null;
}

export interface StockWarehouseCell {
  warehouse_id: string;
  warehouse_name: string;
  present: number;
  reserved: number;
  in_transit: number;
  requested: number;
  arriving: number;
}

export interface StockSkuItem {
  sku: string;
  title: string | null;
  offer_id: string | null;
  fbo: number;
  fbs: number;
  reserved: number;
  in_transit: number;
  requested: number;
  arriving: number;
  fbo_warehouses: StockWarehouseCell[];
  fbs_warehouses: StockWarehouseCell[];
}

export interface InTransitItem {
  sku: string;
  title: string | null;
  scheme: string;
  warehouse_name: string;
  in_transit: number;
  requested: number;
  arriving: number;
}

export interface StocksResponse {
  fbo_units: number;
  fbs_units: number;
  in_transit_units: number;
  requested_units: number;
  arriving_units: number;
  sku_count: number;
  captured_at: string | null;
  items: StockSkuItem[];
  in_transit: InTransitItem[];
}

export interface ExpirationWarehouseCell {
  warehouse_id: string;
  warehouse_name: string;
  present: number;
  expiring: number;
  waiting_docs: number;
  defect: number;
}

export interface ExpirationSkuItem {
  sku: string;
  title: string | null;
  offer_id: string | null;
  present: number;
  expiring: number;
  waiting_docs: number;
  defect: number;
  ads: string | null;
  idc: string | null;
  days_to_sell: number | null;
  action: string;
  warehouses: ExpirationWarehouseCell[];
}

export interface ExpirationResponse {
  expiring_units: number;
  defect_units: number;
  waiting_docs_units: number;
  sku_count: number;
  captured_at: string | null;
  items: ExpirationSkuItem[];
}

export interface ContentItem {
  product_id: string;
  sku: string | null;
  title: string | null;
  content_rating: string | null;
  improve_attributes: Array<{ id?: number; name?: string; group?: string }> | null;
  price: string | null;
  marketing_price: string | null;
  price_index: string | null;
  price_index_label: string | null;
}

export interface FinanceBucket {
  category: string;
  label: string;
  amount: string;
  operations_count: number;
}

export type BusinessModel =
  | "manufacturer"
  | "reseller_rf"
  | "china"
  | "fulfillment"
  | "custom";

export type StorageModel = "mp" | "own" | "ff";

export type TaxSystem =
  | "usn_income"
  | "usn_income_outcome"
  | "osn"
  | "none";

export type ExpenseCalcType =
  | "per_unit"
  | "percent_revenue"
  | "per_order"
  | "monthly"
  | "percent_cogs"
  | "percent_ads"
  | "hybrid";

export type ExpenseLevel = "variable" | "fixed";

export type CostSource = "ozon" | "user";

export interface ExpenseProfilePublic {
  marketplace_id: string;
  business_model: BusinessModel;
  storage_model: StorageModel;
  tax_system: TaxSystem;
  tax_rate: string;
}

export interface ExpenseItemPublic {
  id: string;
  marketplace_id: string;
  name: string;
  calc_type: ExpenseCalcType;
  level: ExpenseLevel;
  amount: string;
  percent: string;
  enabled: boolean;
  calc_type_label: string | null;
  computed: string;
  preset_key: string | null;
}

export interface WaterfallStep {
  key: string;
  label: string;
  amount: string;
  kind: string;
}

export interface SkuExpenseOverride {
  commission_percent: string | null;
  acquiring_percent: string | null;
  other_percent: string | null;
  tax_percent: string | null;
  logistics_amount: string | null;
  ads_amount: string | null;
}

export interface SkuEconomicsRow {
  sku: string;
  product_id: string | null;
  title: string | null;
  units: number;
  revenue: string;
  cogs: string;
  ads: string;
  commission: string;
  acquiring: string;
  logistics: string;
  storage: string;
  other: string;
  tax: string;
  estimated_commission: string;
  contribution: string;
  unit_profit: string | null;
  net_price: string | null;
  cost_source: CostSource | null;
  sales_percent: string | null;
  missing_cogs: boolean;
  fee_source: "realization" | "accrual" | "tariff";
  return_qty: number;
  ordered_units: number;
  delivered_units: number;
  buyout_rate: string | null;
  override: SkuExpenseOverride | null;
}

export interface EconomicsResponse {
  period_from: string;
  period_to: string;
  units: number;
  ordered_units: number;
  delivered_units: number;
  return_units: number;
  cancelled_units: number;
  buyout_rate: string | null;
  revenue: string;
  cogs: string;
  commissions: string;
  logistics: string;
  storage: string;
  marketing: string;
  returns: string;
  other: string;
  custom_variable: string;
  custom_fixed: string;
  tax: string;
  approx_margin: string;
  contribution_margin: string;
  operating_profit: string;
  net_profit: string;
  missing_cogs_sku_count: number;
  by_type: FinanceBucket[];
  waterfall: WaterfallStep[];
  by_sku: SkuEconomicsRow[];
  profile: ExpenseProfilePublic | null;
  items: ExpenseItemPublic[];
}

export interface PricingInputs {
  price: string | null;
  spp_percent: string | null;
  ozon_card_percent: string | null;
  cogs: string | null;
  commission_fbo_percent: string | null;
  commission_fbs_percent: string | null;
  acquiring_percent: string | null;
  other_percent: string | null;
  marketing_percent: string | null;
  delivery_percent: string | null;
  tax_percent: string | null;
  logistics_fbo: string | null;
  logistics_fbs: string | null;
  crossdock: string | null;
  return_logistics_fbo: string | null;
  return_logistics_fbs: string | null;
  buyout_fbo_percent: string | null;
  buyout_fbs_percent: string | null;
  storage: string | null;
  target_margin_fbo_percent: string | null;
  target_margin_fbs_percent: string | null;
}

export type PricingField = keyof PricingInputs;

export interface PricingSchemeResult {
  buyer_price: string;
  fixed_costs: string;
  variable_percent: string;
  cost_cogs: string;
  cost_commission: string;
  cost_acquiring: string;
  cost_logistics: string;
  cost_storage: string;
  cost_other: string;
  cost_tax: string;
  cost_ads: string;
  total_costs: string;
  margin_no_ads: string;
  margin_no_ads_pct: string | null;
  margin_with_ads: string;
  margin_with_ads_pct: string | null;
  price_at_target: string | null;
}

export interface PricingRow {
  sku: string;
  product_id: string;
  title: string | null;
  inputs: PricingInputs;
  buyer_price: string;
  fbo: PricingSchemeResult;
  fbs: PricingSchemeResult;
}

export interface PricingListResponse {
  items: PricingRow[];
}

export interface ExpenseCatalogResponse {
  profile: ExpenseProfilePublic;
  items: ExpenseItemPublic[];
  updated_at: string | null;
}

export interface ExpenseProfileUpdate {
  business_model?: BusinessModel;
  storage_model?: StorageModel;
  tax_system?: TaxSystem;
  tax_rate?: string;
}

export interface ExpenseItemWrite {
  name: string;
  calc_type: ExpenseCalcType;
  level: ExpenseLevel;
  amount: string;
  percent: string;
  enabled: boolean;
}

export interface PresetItemPublic {
  key: string;
  name: string;
  calc_type: ExpenseCalcType;
  level: ExpenseLevel;
  hint: string;
  calc_type_label: string | null;
}

export interface ExpensePresetPublic {
  business_model: Exclude<BusinessModel, "custom">;
  label: string;
  description: string;
  default_storage: StorageModel;
  items: PresetItemPublic[];
}

export interface ExpensePresetsResponse {
  models: ExpensePresetPublic[];
  storage: Record<string, PresetItemPublic[]>;
  common_fixed: PresetItemPublic[];
}

export interface ApplyExpensePresetRequest {
  business_model: BusinessModel;
  storage_model: StorageModel;
  values: Record<string, { amount: string; percent: string }>;
}

export interface CabinetHealthItem {
  rating: string;
  name: string | null;
  current_value: number | null;
  status: string | null;
  status_label: string | null;
  value_type: string | null;
  group_name: string | null;
}

export interface CabinetHealthResponse {
  captured_at: string | null;
  items: CabinetHealthItem[];
  raw_groups: unknown;
}

export interface BriefingItem {
  kind: string;
  priority: number;
  title: string;
  detail: string;
  action: string;
  sku: string | null;
  product_id: string | null;
  href: string;
}

export interface BriefingResponse {
  generated_at: string;
  items: BriefingItem[];
  total_candidates: number;
}

export interface MarketingSummary {
  spend: string;
  views: number;
  clicks: number;
  orders: number;
  orders_money: string;
  income: string;
  drr: string | null;
  ctr: string | null;
  campaigns_total: number;
  campaigns_running: number;
  period_from: string;
  period_to: string;
  has_performance_token: boolean;
}

export interface MarketingSeriesPoint {
  date: string;
  spend: string;
  views: number;
  clicks: number;
  orders: number;
  orders_money: string;
}

export interface MarketingSeriesResponse {
  period_from: string;
  period_to: string;
  series: MarketingSeriesPoint[];
}

export interface CampaignItem {
  external_id: string;
  title: string | null;
  state: string | null;
  adv_object_type: string | null;
  payment_type: string | null;
  daily_budget: string | null;
  spend: string;
  views: number;
  clicks: number;
  orders: number;
  orders_money: string;
  drr: string | null;
  ctr: string | null;
}

export interface CampaignsResponse {
  period_from: string;
  period_to: string;
  items: CampaignItem[];
}

export interface SkuMarketingItem {
  sku: string;
  title: string | null;
  product_id: string | null;
  spend: string;
  views: number;
  clicks: number;
  orders: number;
  orders_money: string;
  drr: string | null;
}

export interface SkusResponse {
  period_from: string;
  period_to: string;
  items: SkuMarketingItem[];
}

export interface SkuGroupMarketingItem {
  group_key: string;
  title: string | null;
  spend: string;
  views: number;
  clicks: number;
  carts: number | null;
  orders: number;
  orders_money: string;
  income: string;
  drr: string | null;
}

export interface SkuGroupsResponse {
  period_from: string;
  period_to: string;
  items: SkuGroupMarketingItem[];
}

export interface ActionProductItem {
  product_external_id: string;
  product_id: string | null;
  title: string | null;
  sku: string | null;
  price: string | null;
  action_price: string | null;
  max_action_price: string | null;
  add_mode: string | null;
  min_stock: number | null;
  stock: number | null;
}

export interface ActionItem {
  external_id: string;
  title: string;
  action_type: string | null;
  description: string | null;
  date_start: string | null;
  date_end: string | null;
  freeze_date: string | null;
  potential_products_count: number;
  participating_products_count: number;
  is_participating: boolean;
  is_voucher_action: boolean;
  banned_products_count: number;
  with_targeting: boolean;
  order_amount: string | null;
  discount_type: string | null;
  discount_value: string | null;
  products: ActionProductItem[];
}

export interface ActionsResponse {
  total: number;
  participating: number;
  items: ActionItem[];
}

export interface DiscountTaskItem {
  id: number;
  status: string;
  sku: string | null;
  offer_id: string | null;
  title: string | null;
  customer_name: string | null;
  user_comment: string | null;
  original_price: string | null;
  requested_price: string | null;
  discount_percent: string | null;
  requested_quantity_min: number | null;
  requested_quantity_max: number | null;
  created_at: string | null;
  edited_till: string | null;
  end_at: string | null;
  remaining_seconds: number | null;
}

export interface DiscountTasksResponse {
  threshold_percent: string;
  pending: number;
  lte_count: number;
  gt_count: number;
  lte_threshold: DiscountTaskItem[];
  gt_threshold: DiscountTaskItem[];
}

export interface DiscountTaskDecideResponse {
  action: "approve" | "decline";
  success_count: number;
  fail_count: number;
  failures: string[];
}

export interface AutoAddProductItem {
  action_id: number;
  action_title: string;
  auto_add_date: string;
  product_id: number;
  offer_id: string | null;
  sku: string | null;
  title: string | null;
  price: string | null;
  action_price: string | null;
  add_mode: string | null;
}

export interface AutoAddProductRef {
  action_id: number;
  auto_add_date: string;
  product_id: number;
}

export interface AutoAddProductsResponse {
  total: number;
  items: AutoAddProductItem[];
}

export interface AutoAddProductsDeleteResponse {
  deleted_count: number;
  product_ids: number[];
}

export interface OrganizationPublic {
  id: string;
  name: string;
  owner_user_id: string;
  created_at: string;
}

export interface OrganizationMemberPublic {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: OrgMemberRole;
  joined_at: string;
}

export interface OrganizationInvitePublic {
  id: string;
  email: string;
  role: OrgMemberRole;
  status: InviteStatus;
  expires_at: string;
  created_at: string;
  invite_url: string | null;
}

export interface OrganizationOverview {
  organization: OrganizationPublic;
  my_role: OrgMemberRole;
  members: OrganizationMemberPublic[];
  pending_invites: OrganizationInvitePublic[];
}

export interface InvitePreview {
  organization_name: string;
  email: string;
  role: OrgMemberRole;
  status: InviteStatus;
  expires_at: string;
}

export interface Task {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  assignee_name: string | null;
  assignee_email: string | null;
  created_by_id: string | null;
  source_type: TaskSourceType;
  source_ref: Record<string, unknown> | null;
  marketplace_id: string | null;
  created_at: string;
  updated_at: string;
  comment_count: number;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  body: string;
  created_at: string;
}
