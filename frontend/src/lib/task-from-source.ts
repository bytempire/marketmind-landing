import type { Insight, OosItem, TaskPriority, TaskSourceType } from "./types";

type InsightLike = Pick<
  Insight,
  "title" | "body" | "type" | "problem" | "impact" | "action" | "priority"
> & { id?: string };

export function priorityFromInsightScore(score?: number | null): TaskPriority {
  if (score == null) return "medium";
  if (score >= 85) return "urgent";
  if (score >= 70) return "high";
  return "medium";
}

export function priorityFromOos(item: OosItem): TaskPriority {
  const idc = item.idc != null ? Number(item.idc) : null;
  if (idc != null && idc <= 3) return "urgent";
  if (idc != null && idc <= 7) return "high";
  return "medium";
}

export function oosChannels(item: OosItem): string[] {
  return [
    (item.available_fbo ?? item.fbo ?? 0) <= 0 ? "FBO" : null,
    (item.available_fbs ?? item.fbs ?? 0) <= 0 ? "FBS" : null,
  ].filter((x): x is string => Boolean(x));
}

export function taskPayloadFromInsight(
  insight: InsightLike,
  marketplaceId?: string | null,
) {
  const lines = [
    insight.problem,
    insight.impact ? `Почему важно: ${insight.impact}` : null,
    insight.action ? `Действие: ${insight.action}` : null,
  ].filter(Boolean);
  return {
    title: insight.title,
    description: lines.join("\n\n") || insight.body,
    priority: priorityFromInsightScore(insight.priority),
    source_type: "insight" as TaskSourceType,
    source_ref: {
      insight_id: insight.id ?? null,
      type: insight.type,
      title: insight.title,
      problem: insight.problem,
      action: insight.action,
      deep_link: "/insights",
    },
    marketplace_id: marketplaceId ?? undefined,
  };
}

export function taskPayloadFromOos(item: OosItem, marketplaceId?: string | null) {
  const channels = oosChannels(item);
  const name = item.title?.trim() || item.sku;
  const idcText =
    item.idc != null && Number(item.idc) >= 0
      ? `${Math.round(Number(item.idc))} дн.`
      : "—";
  return {
    title: `OOS: ${name}`,
    description: [
      `SKU: ${item.sku}`,
      channels.length ? `Без запаса: ${channels.join(", ")}` : null,
      `IDC: ${idcText}`,
      item.turnover_grade_label
        ? `Оборачиваемость: ${item.turnover_grade_label}`
        : null,
    ]
      .filter(Boolean)
      .join("\n"),
    priority: priorityFromOos(item),
    source_type: "oos" as TaskSourceType,
    source_ref: {
      sku: item.sku,
      product_id: item.product_id,
      title: item.title,
      idc: item.idc,
      channels,
      deep_link: "/commerce/stocks",
    },
    marketplace_id: marketplaceId ?? undefined,
  };
}
