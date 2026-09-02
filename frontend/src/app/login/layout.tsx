import { Manrope, Unbounded } from "next/font/google";
import type { ReactNode } from "react";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-landing",
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  display: "swap",
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${manrope.variable} ${unbounded.variable} font-[family-name:var(--font-landing)] antialiased`}
    >
      {children}
    </div>
  );
}
