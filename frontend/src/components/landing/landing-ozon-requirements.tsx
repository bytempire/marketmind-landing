"use client";

import { motion } from "motion/react";

export function LandingOzonRequirements() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.45 }}
        className="max-w-3xl border-l-2 border-white/40 pl-5"
      >
        <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight text-white sm:text-2xl">
          Важно для Ozon
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/70 sm:text-base">
          <li>
            ИИ по отзывам и вопросам подключается при подписке{" "}
            <span className="font-medium text-white">Premium Pro</span>.
          </li>
          <li>
            Без Premium Pro остаётся коммерческая аналитика: продажи, остатки,
            контент, unit-экономика и рейтинг кабинета.
          </li>
        </ul>
      </motion.div>
    </section>
  );
}
