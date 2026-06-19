import { AppCard } from "@/components/ui/AppCard";
import { getMomentumLabel } from "@/lib/utils/labels";
import type { MomentumState } from "@/types/commit";

type MomentumCardProps = {
  momentum: MomentumState;
  message: string;
  insight?: string;
};

export function MomentumCard({
  momentum,
  message,
  insight,
}: MomentumCardProps) {
  return (
    <AppCard className="relative overflow-hidden p-6 shadow-[0_28px_90px_rgb(0_0_0/0.42)]">
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[var(--accent-soft)] blur-3xl" />
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[var(--accent-border)] to-transparent" />
      <div className="relative flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
            Momentum
          </p>
          <h2 className="mt-4 text-5xl font-semibold tracking-normal text-primary-text">
            {getMomentumLabel(momentum)}
          </h2>
        </div>
        <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] shadow-[0_0_50px_var(--accent-glow)]">
          <div className="absolute inset-2 rounded-full border border-white/8" />
          <div className="h-3 w-3 rounded-full bg-accent shadow-[0_0_24px_var(--accent-border)]" />
        </div>
      </div>
      <p className="relative mt-7 max-w-[18rem] text-base leading-7 text-secondary-text">
        {message}
      </p>
      {insight && (
        <p className="relative mt-5 rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-4 text-sm leading-6 text-primary-text">
          {insight}
        </p>
      )}
    </AppCard>
  );
}
