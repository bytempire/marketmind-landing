"use client";

import { motion } from "motion/react";

import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingHowto } from "@/components/landing/landing-howto";
import { LandingOzonRequirements } from "@/components/landing/landing-ozon-requirements";
import { LandingPricing } from "@/components/landing/landing-pricing";
import Lightfall from "@/components/landing/lightfall";
import { ProductPreview } from "@/components/landing/product-preview";
import { YandexLoginButton } from "@/components/landing/yandex-login-button";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-white">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <Lightfall
          className="h-full w-full"
          colors={["#A6C8FF", "#5227FF", "#FF9FFC"]}
          backgroundColor="#0A29FF"
          speed={0.5}
          streakCount={2}
          streakWidth={1}
          streakLength={1}
          glow={0.5}
          density={0.6}
          twinkle={1}
          zoom={3}
          backgroundGlow={0}
          opacity={1}
          dpr={1}
          maxFps={30}
          mouseInteraction={false}
        />
      </div>

      <div className="relative z-10">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <span className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight text-white">
            MarketMind AI
          </span>
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="#pricing"
              className="hidden text-sm text-white/70 transition-colors hover:text-white sm:inline"
            >
              Тарифы
            </a>
            <a
              href="#howto"
              className="hidden text-sm text-white/70 transition-colors hover:text-white sm:inline"
            >
              Как начать
            </a>
          </div>
        </header>

        <section className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-6xl items-center gap-12 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              MarketMind AI
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-5 max-w-xl text-xl font-medium leading-snug tracking-tight text-white/95 sm:text-2xl"
            >
              AI Copilot для продавцов Ozon и Wildberries
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.14 }}
              className="mt-4 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg"
            >
              Автоответы на отзывы и вопросы, поиск причин негатива, анализ
              продаж и коммерции — в одном кабинете.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <YandexLoginButton />
              <a
                href="#pricing"
                className="text-sm text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Смотреть тарифы
              </a>
            </motion.div>
          </div>

          <ProductPreview />
        </section>

        <div id="features">
          <LandingFeatures />
        </div>

        <LandingOzonRequirements />

        <LandingPricing />

        <div id="howto">
          <LandingHowto />
        </div>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="max-w-xl">
              <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-white sm:text-4xl">
                Начните с Яндекс ID
              </h2>
              <p className="mt-3 text-base text-white/70">
                Тариф «Базовый» — 4 900 ₽/мес: коммерция и маркетинг. Войдите
                через Яндекс ID, подключите кабинет и начните работу.
              </p>
            </div>
            <YandexLoginButton />
          </motion.div>
        </section>

        <footer className="border-t border-white/15 py-8 text-center text-sm text-white/60">
          MarketMind AI · Ozon · Wildberries
        </footer>
      </div>
    </div>
  );
}
