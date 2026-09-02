"use client";

import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

type YandexLoginButtonProps = {
  className?: string;
  size?: "default" | "lg";
  /** Для демо-сайта (GitHub Pages): ссылка вместо OAuth */
  demoHref?: string;
};

export function YandexLoginButton({
  className,
  size = "lg",
  demoHref = process.env.NEXT_PUBLIC_DEMO_LOGIN_URL,
}: YandexLoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (demoHref) {
    return (
      <a
        href={demoHref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ size }), className)}
      >
        Открыть приложение
      </a>
    );
  }

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      const { authorize_url } = await apiFetch<{ authorize_url: string }>(
        "/auth/yandex/login",
      );
      window.location.href = authorize_url;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось начать вход");
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col items-start gap-2", className)}>
      <Button onClick={handleLogin} disabled={loading} size={size}>
        {loading ? "Перенаправление…" : "Войти через Яндекс ID"}
      </Button>
      {error ? (
        <p className="text-sm text-[var(--destructive)]">{error}</p>
      ) : null}
    </div>
  );
}
