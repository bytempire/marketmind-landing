"use client";

import { motion } from "motion/react";

const rows = [
  {
    kind: "Вопрос",
    text: "Подойдёт ли чехол к iPhone 15?",
    answer: "Да, модель совместима с iPhone 15 и 15 Pro.",
    tone: "neutral" as const,
  },
  {
    kind: "Отзыв · 2★",
    text: "Пришла мятая коробка, товар целый",
    answer: "Извините за упаковку — усилим контроль на складе.",
    tone: "risk" as const,
    pain: "Упаковка",
  },
  {
    kind: "Отзыв · 5★",
    text: "Быстрая доставка, всё как в описании",
    answer: "Спасибо! Рады, что товар оправдал ожидания.",
    tone: "good" as const,
  },
];

export function ProductPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
      aria-hidden
    >
      <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_70%)]" />
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.45)] backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-xs text-[var(--muted-foreground)]">
            Очередь · AI-черновики
          </span>
          <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs font-medium tabular-nums">
            Health 86
          </span>
        </div>

        <div className="space-y-3 p-4">
          {rows.map((row, index) => (
            <motion.div
              key={row.text}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.45,
                delay: 0.45 + index * 0.12,
                ease: "easeOut",
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[11px] text-[var(--muted-foreground)]">
                <span>{row.kind}</span>
                {row.pain ? (
                  <span className="rounded bg-[color-mix(in_oklab,var(--destructive)_12%,transparent)] px-1.5 py-0.5 text-[var(--destructive)]">
                    {row.pain}
                  </span>
                ) : null}
                {row.tone === "good" ? (
                  <span className="rounded bg-[var(--muted)] px-1.5 py-0.5">
                    позитив
                  </span>
                ) : null}
              </div>
              <p className="text-sm leading-snug">{row.text}</p>
              <p className="mt-2 border-l-2 border-[var(--primary)] pl-2 text-sm text-[var(--muted-foreground)]">
                {row.answer}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
