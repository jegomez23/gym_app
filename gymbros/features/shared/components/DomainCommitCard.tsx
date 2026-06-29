import Link from "next/link";

import { AppCard } from "@/components/ui/AppCard";
import type { Commit, JourneyItem } from "@/lib/dal";

import { activityKindLabel } from "../activityKinds";

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
  // Evidence expresses its movement (Phase 51): a run reads as a run, a hike as a
  // hike. When a title was written, the discipline rides quietly on the meta line;
  // when it wasn't, the discipline becomes the title — never a raw machine key.
  const movement = activityKindLabel(commit.type);
  const title = commit.title || movement || "Evidencia";
  const meta =
    commit.title && movement
      ? `${movement} · ${formatDate(commit.recordedAt)}`
      : formatDate(commit.recordedAt);

  // The user's written words now live in the reflection (one note, not a split
  // note + reflection). Show them once, prominently: prefer a legacy commit.note,
  // else the reflection. A secondary reflection block appears only when a legacy
  // commit carries a distinct reflection — never echoing the same words twice.
  const body = commit.note || reflections[0]?.content || null;
  const secondaryReflection =
    reflections[0] && reflections[0].content !== body
      ? reflections[0].content
      : null;

  // Evidence is openable: the whole card is a quiet link into the full document
  // of that experience (its account, added to over time). Calm affordance only —
  // a soft lift on hover/focus, never a chevron or a "read more".
  return (
    <Link
      aria-label={`Abrir ${title}`}
      className="block rounded-[inherit] outline-none transition-colors duration-[var(--duration-base)] focus-visible:ring-2 focus-visible:ring-accent"
      href={`/evidence/${commit.id}`}
    >
      <AppCard className="transition-colors duration-[var(--duration-base)] hover:bg-white/[0.02]">
        <div className="flex items-start justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="text-label uppercase text-accent">{eyebrow}</p>
            )}
            <h2 className="mt-2 text-heading text-primary-text">{title}</h2>
            <p className="mt-1 text-label uppercase text-secondary-text">
              {meta}
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

        {body && <p className="mt-4 text-body text-primary-text">{body}</p>}

        {secondaryReflection && (
          <div className="mt-4 rounded-md bg-white/4 p-4">
            <p className="text-body text-secondary-text">
              {secondaryReflection}
            </p>
          </div>
        )}
      </AppCard>
    </Link>
  );
}
