"use client";

import { motion } from "motion/react";

const steps = [
  {
    n: "01",
    title: "Войдите через Яндекс ID",
    text: "Один клик — аккаунт создаётся автоматически, отдельная регистрация не нужна.",
  },
  {
    n: "02",
    title: "Подключите кабинет WB или Ozon",
    text: "В «Маркетплейсы» добавьте API-ключ. На Ozon ИИ по обращениям — при Premium Pro.",
  },
  {
    n: "03",
    title: "Дождитесь синхронизации",
    text: "Сервис импортирует доступные данные: отзывы и вопросы (при нужной подписке Ozon) и продажи.",
  },
  {
    n: "04",
    title: "Проверьте и публикуйте ответы",
    text: "AI готовит черновики. При высокой уверенности — автопубликация, иначе — ручная проверка.",
  },
  {
    n: "05",
    title: "Смотрите аналитику и продажи",
    text: "Дашборд — негатив и Health Score. Раздел «Коммерция» — выручка, остатки, цены, маржа и брифинг действий.",
  },
];

export function LandingHowto() {
  return (
    <section className="border-y border-white/15">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-white sm:text-4xl">
            Как пользоваться
          </h2>
          <p className="mt-3 text-base text-white/70 sm:text-lg">
            От входа до первых автоответов — несколько минут. Дальше сервис
            работает в фоне.
          </p>
        </motion.div>

        <ol className="mt-12 space-y-0">
          {steps.map((step, index) => (
            <motion.li
              key={step.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className="grid grid-cols-[3.5rem_1fr] gap-4 border-t border-white/15 py-6 sm:grid-cols-[4.5rem_12rem_1fr] sm:gap-8"
            >
              <span className="font-[family-name:var(--font-display)] text-sm tabular-nums text-white/50">
                {step.n}
              </span>
              <h3 className="text-base font-semibold tracking-tight text-white sm:pt-0">
                {step.title}
              </h3>
              <p className="col-span-2 text-sm leading-relaxed text-white/65 sm:col-span-1 sm:col-start-3">
                {step.text}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
