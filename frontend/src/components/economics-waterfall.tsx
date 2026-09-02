import { formatMoney, moneyTone } from "@/components/commerce-ui";
import type { WaterfallStep } from "@/lib/types";

const STEP_HINT: Record<string, string> = {
  revenue: "Деньги с выкупленных заказов за период",
  cogs: "Закупка выкупленных штук",
  commissions: "Комиссия площадки и эквайринг",
  logistics: "Прямая доставка до покупателя",
  returns: "Обратная логистика и возвраты из финансов Ozon",
  storage: "Хранение на складе Ozon",
  marketing: "Реклама Ozon Performance",
  other: "Штрафы и прочие списания, которые не попали в корзины выше",
  contribution: "Что осталось после переменных расходов — здоровье товаров",
  operating: "После постоянных: аренда, зарплата, сервисы",
  tax: "Налог по системе из профиля кабинета",
  net: "Сколько кабинет заработал или потерял за период",
};

export function EconomicsWaterfall({ steps }: { steps: WaterfallStep[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {steps.map((step) => {
        const isTotal = step.kind === "total" || step.kind === "subtotal";
        const isRevenue = step.kind === "revenue";
        const amount = Number(step.amount);
        if (!isRevenue && !isTotal && amount === 0) return null;
        const hint = STEP_HINT[step.key] ?? "Статья расхода кабинета";
        return (
          <li
            key={step.key}
            className={`flex justify-between text-sm ${
              isTotal ? "border-t border-[var(--border)] pt-2 font-medium" : ""
            }`}
          >
            <span
              className="cursor-help truncate pr-2 border-b border-dotted border-transparent hover:border-[var(--muted-foreground)]/60"
              title={hint}
            >
              {step.label}
            </span>
            <span
              className={`shrink-0 ${
                isRevenue
                  ? ""
                  : isTotal
                    ? moneyTone(amount)
                    : "text-[var(--muted-foreground)]"
              }`}
            >
              {isRevenue || isTotal
                ? formatMoney(step.amount)
                : `− ${formatMoney(step.amount)}`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
