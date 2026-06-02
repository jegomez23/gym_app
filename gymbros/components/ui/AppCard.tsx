import type { ReactNode } from "react";

type AppCardProps = {
  children: ReactNode;
  className?: string;
};

export function AppCard({ children, className = "" }: AppCardProps) {
  return (
    <section
      className={`premium-surface rounded-[2rem] border border-white/8 p-5 shadow-[0_22px_70px_rgb(0_0_0/0.34)] backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}
