import type { PlanType } from "@/lib/types";

export type PlanInfo = {
  id: PlanType;
  name: string;
  limit: number;
  description: string;
  priceRub: number;
  priceLabel: string;
  features: string[];
  payable: boolean;
};

export const PLAN_PRICES_RUB: Record<PlanType, number> = {
  commerce: 4900,
  starter: 9990,
  business: 0,
  pro: 0,
};

function priceLabel(amount: number): string {
  return amount > 0 ? `${amount.toLocaleString("ru-RU")} ₽` : "Цена скоро";
}

export const PLANS: PlanInfo[] = [
  {
    id: "commerce",
    name: "Базовый",
    limit: 0,
    description: "Продажи, остатки, unit-экономика и рекламная аналитика.",
    priceRub: PLAN_PRICES_RUB.commerce,
    priceLabel: priceLabel(PLAN_PRICES_RUB.commerce),
    features: [
      "Коммерция",
      "Маркетинг",
      "Отзывы и вопросы вручную",
      "Без AI",
    ],
    payable: true,
  },
  {
    id: "starter",
    name: "Старт",
    limit: 300,
    description: "Базовый плюс AI-аналитика по коммерции.",
    priceRub: PLAN_PRICES_RUB.starter,
    priceLabel: priceLabel(PLAN_PRICES_RUB.starter),
    features: [
      "Всё из «Базовый»",
      "AI-аналитика по коммерции",
      "300 обращений / мес",
    ],
    payable: true,
  },
  {
    id: "business",
    name: "Бизнес",
    limit: 1500,
    description: "AI-аналитика по отзывам и ответы на обращения.",
    priceRub: PLAN_PRICES_RUB.business,
    priceLabel: priceLabel(PLAN_PRICES_RUB.business),
    features: [
      "Всё из «Старт»",
      "AI-аналитика по отзывам",
      "AI-ответы на отзывы и вопросы",
      "1 500 обращений / мес",
    ],
    payable: false,
  },
  {
    id: "pro",
    name: "Про",
    limit: 5000,
    description: "Максимальный лимит AI-ответов и аналитики.",
    priceRub: PLAN_PRICES_RUB.pro,
    priceLabel: priceLabel(PLAN_PRICES_RUB.pro),
    features: [
      "Всё из «Бизнес»",
      "AI-аналитика по отзывам",
      "AI-ответы на отзывы и вопросы",
      "5 000 обращений / мес",
    ],
    payable: false,
  },
];

export const PLAN_LABELS: Record<PlanType, string> = {
  commerce: "Базовый",
  starter: "Старт",
  business: "Бизнес",
  pro: "Про",
};

export function planHasAi(plan: PlanType): boolean {
  return plan !== "commerce";
}

export function planHasReviewAi(plan: PlanType): boolean {
  return plan === "business" || plan === "pro";
}
