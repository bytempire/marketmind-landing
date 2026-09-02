import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DemoProviders } from "./demo-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarketMind AI — AI Copilot для Ozon и Wildberries",
  description:
    "Автоответы на отзывы, аналитика продаж и коммерции для продавцов маркетплейсов.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement,t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))d.classList.add("dark")}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <DemoProviders>{children}</DemoProviders>
      </body>
    </html>
  );
}
