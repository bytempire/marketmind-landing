"use client";

import { motion } from "motion/react";

import { PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function LandingPricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-white sm:text-4xl">
          Тарифы
        </h2>
        <p className="mt-3 text-base text-white/70 sm:text-lg">
          «Базовый» — продажи и маркетинг без AI. «Старт» — AI-аналитика
          по коммерции. «Бизнес» и «Про» — плюс AI по отзывам и ответы. На
          Ozon для AI нужна подписка Premium Pro у продавца.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan, index) => {
          const featured = plan.id === "commerce";
          return (
            <motion.article
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className={cn(
                "flex flex-col rounded-2xl border bg-black/25 p-5 backdrop-blur-md",
                featured
                  ? "border-[#6366f1]/70 ring-1 ring-[#6366f1]/50"
                  : "border-white/15",
              )}
            >
              <h3 className="text-lg font-semibold tracking-tight text-white">
                {plan.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                {plan.description}
              </p>
              <div className="mt-5">
                <p className="text-2xl font-semibold tracking-tight text-white">
                  {plan.priceLabel}
                </p>
                <p className="text-xs text-white/50">в месяц</p>
              </div>
              <ul className="mt-5 space-y-1.5 text-sm text-white/70">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
