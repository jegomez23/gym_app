import { AppCard } from "@/components/ui/AppCard";
import type { Commit, JourneyItem } from "@/lib/dal";

type DomainCommitCardProps = {
  commit: Commit | JourneyItem;
  eyebrow?: string;
};

const intensityLabels: Record<string, string> = {
  light: "Ligero",
  steady: "Constante",
  deep: "Profundo",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function DomainCommitCard({ commit, eyebrow }: DomainCommitCardProps) {
  const reflections =
    "reflections" in commit && Array.isArray(commit.reflections)
      ? commit.reflections
      : [];
  const title = commit.title || commit.type || "Commit";

  return (
    <AppCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-2 text-xl font-semibold text-primary-text">
            {title}
          </h2>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-secondary-text">
            {formatDate(commit.recordedAt)}
          </p>
        </div>
        <span className="rounded-full border border-white/8 px-3 py-1 text-xs font-semibold text-secondary-text">
          {commit.intensity ? intensityLabels[commit.intensity] : "Sin ritmo"}
        </span>
      </div>

      {commit.note && (
        <p className="mt-4 text-sm leading-6 text-primary-text">
          {commit.note}
        </p>
      )}

      {reflections.length > 0 && (
        <div className="mt-4 rounded-2xl bg-white/[0.035] p-4">
          <p className="text-sm leading-6 text-secondary-text">
            {reflections[0].content}
          </p>
        </div>
      )}
    </AppCard>
  );
}
