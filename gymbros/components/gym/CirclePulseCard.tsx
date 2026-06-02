import { AppCard } from "@/components/ui/AppCard";

type CirclePulseCardProps = {
  trainedTodayCount: number;
};

const pulseItems = [
  "David hizo un Commit hoy.",
  "María sostuvo el ritmo.",
  "Alguien está retomando.",
];

export function CirclePulseCard({ trainedTodayCount }: CirclePulseCardProps) {
  return (
    <AppCard className="relative overflow-hidden">
      <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-[var(--accent-soft)] blur-3xl" />
      <div className="relative flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
            Pulso del Círculo
          </p>
          <p className="mt-3 max-w-[15rem] text-lg font-semibold leading-7 text-primary-text">
            Tu círculo avanza en silencio contigo.
          </p>
        </div>
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] text-2xl font-semibold text-accent shadow-[0_0_34px_var(--accent-glow)]">
          {trainedTodayCount}
        </div>
      </div>
      <div className="relative mt-5 flex flex-col gap-2">
        {pulseItems.map((item) => (
          <p
            className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 text-sm text-secondary-text"
            key={item}
          >
            {item}
          </p>
        ))}
      </div>
    </AppCard>
  );
}
