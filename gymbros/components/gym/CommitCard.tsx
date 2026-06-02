import { AppCard } from "@/components/ui/AppCard";
import { getRelativeCommitDate } from "@/lib/utils/archive";
import { getFeelingLabel, getTrainingLabel } from "@/lib/utils/labels";
import type { Commit } from "@/types/commit";

type CommitCardProps = {
  commit: Commit;
  eyebrow?: string;
};

function getCommitTrainingLabel(commit: Commit) {
  return commit.trainingFocus
    ? getTrainingLabel(commit.trainingFocus)
    : commit.title;
}

function getCommitFeelingLabel(commit: Commit) {
  return getFeelingLabel(commit.feeling ?? commit.intensity);
}

export function CommitCard({ commit, eyebrow = "Commit" }: CommitCardProps) {
  const reflection =
    commit.note.trim() || "Sin reflexión. La evidencia sigue aquí.";

  return (
    <AppCard className="relative overflow-hidden">
      <div className="absolute right-6 top-6 h-16 w-16 rounded-full bg-[var(--accent-soft)] blur-2xl" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
            {eyebrow}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-primary-text">
            {getCommitTrainingLabel(commit)}
          </h3>
        </div>
        <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-medium text-accent">
          {getRelativeCommitDate(commit.date)}
        </span>
      </div>
      <p className="mt-3 text-sm font-medium text-accent">
        Se sintió {getCommitFeelingLabel(commit).toLowerCase()}
      </p>
      <p className="mt-3 text-sm leading-6 text-secondary-text">{reflection}</p>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
        Guardado como evidencia.
      </p>
    </AppCard>
  );
}
