import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/BottomNav";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="min-h-dvh bg-background text-primary-text">
      {children}
      <BottomNav />
    </main>
  );
}
