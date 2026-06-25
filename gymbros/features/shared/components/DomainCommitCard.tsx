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

const intensityColor: Record<string, string> = {
  light: "var(--intensity-light)",
  steady: "var(--intensity-steady)",
  deep: "var(--intensity-deep)",
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
            <p className="text-label uppercase text-accent">{eyebrow}</p>
          )}
          <h2 className="mt-2 text-heading text-primary-text">{title}</h2>
          <p className="mt-1 text-label uppercase text-secondary-text">
            {formatDate(commit.recordedAt)}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/8 px-3 py-1 text-caption font-semibold text-secondary-text">
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: commit.intensity
                ? intensityColor[commit.intensity]
                : "var(--text-secondary)",
            }}
          />
          {commit.intensity ? intensityLabels[commit.intensity] : "Sin ritmo"}
        </span>
      </div>

      {commit.note && (
        <p className="mt-4 text-body text-primary-text">{commit.note}</p>
      )}

      {reflections.length > 0 && (
        <div className="mt-4 rounded-md bg-white/4 p-4">
          <p className="text-body text-secondary-text">
            {reflections[0].content}
          </p>
        </div>
      )}
    </AppCard>
  );
}
