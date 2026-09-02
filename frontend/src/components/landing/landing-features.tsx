"use client";

import {
  BarChart3,
  LineChart,
  MessageSquareReply,
  PackageSearch,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: MessageSquareReply,
    title: "AI-ответы на вопросы и отзывы",
    text: "Генерирует черновики с учётом товара, FAQ и истории. На Ozon ИИ работает при Premium Pro.",
  },
  {
    icon: Search,
    title: "Анализ болей клиентов",
    text: "Определяет тональность, категорию проблемы и риск: упаковка, качество, размер, доставка и другие.",
  },
  {
    icon: BarChart3,
    title: "Аналитика отзывов и Health Score",
    text: "Дашборд по негативу, топ проблем и оценка «здоровья» товаров, чтобы видеть системные сбои.",
  },
  {
    icon: LineChart,
    title: "Анализ продаж и коммерции",
    text: "Выручка и заказы за 90 дней, unit-экономика и маржа, индекс цен, рейтинг карточки и здоровье кабинета Ozon.",
  },
  {
    icon: PackageSearch,
    title: "Остатки, OOS и брифинг",
    text: "Оборачиваемость и риск out-of-stock, слабый контент и падение продаж — приоритетный список действий на день.",
  },
  {
    icon: RefreshCw,
    title: "Синхронизация WB и Ozon",
    text: "Подключаете кабинеты — сервис сам подтягивает отзывы, вопросы, продажи и обновляет данные по расписанию.",
  },
  {
    icon: ShieldCheck,
    title: "Контроль перед публикацией",
    text: "Низкая уверенность модели уходит на ручную проверку. Порог автопубликации настраивается в профиле.",
  },
];

export function LandingFeatures() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-white sm:text-4xl">
          Что умеет сервис
        </h2>
        <p className="mt-3 text-base text-white/70 sm:text-lg">
          Закрывает рутину обращений, находит причины негатива и показывает
          картину продаж — от выручки и остатков до unit-экономики.
        </p>
      </motion.div>

      <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <motion.li
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: index * 0.05 }}
          >
            <feature.icon
              className="mb-3 h-5 w-5 text-white/90"
              strokeWidth={1.75}
            />
            <h3 className="text-base font-semibold tracking-tight text-white">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              {feature.text}
            </p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
