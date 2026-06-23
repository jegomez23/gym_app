import type { ReactNode } from "react";

type CardLevel = "hero" | "primary" | "quiet";

type AppCardProps = {
  children: ReactNode;
  className?: string;
  /**
   * Visual altitude. Every screen should have exactly one `hero`.
   * - hero: the screen's single anchor (largest radius, deepest elevation)
   * - primary: standard content card (default)
   * - quiet: recessive, grouped or secondary content
   */
  level?: CardLevel;
};

const levelClass: Record<CardLevel, string> = {
  hero: "premium-surface rounded-xl border border-white/8 p-6 shadow-e3 backdrop-blur-xl",
  primary:
    "premium-surface rounded-lg border border-white/8 p-5 shadow-e2 backdrop-blur-xl",
  quiet: "rounded-lg border border-white/6 bg-surface-quiet p-4",
};

export function AppCard({
  children,
  className = "",
  level = "primary",
}: AppCardProps) {
  return (
    <section className={`${levelClass[level]} ${className}`}>
      {children}
    </section>
  );
}
