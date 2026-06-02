import type { Commit } from "@/types/commit";

type EvidenceStripProps = {
  commits: Commit[];
};

const fallbackDays = ["Lun", "Mié", "Vie", "Hoy"];

function getEvidenceLabels(commits: Commit[]) {
  if (commits.length === 0) {
    return fallbackDays;
  }

  return commits.slice(0, 5).map((commit, index) => {
    if (index === 0) {
      return "Hoy";
    }

    return new Intl.DateTimeFormat("es", {
      weekday: "short",
    }).format(new Date(`${commit.date}T00:00:00`));
  });
}

export function EvidenceStrip({ commits }: EvidenceStripProps) {
  const labels = getEvidenceLabels(commits);

  return (
    <section className="rounded-[2rem] border border-white/8 bg-white/[0.035] p-5 shadow-[0_18px_55px_rgb(0_0_0/0.24)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
            Evidencia
          </p>
          <p className="mt-2 text-sm leading-6 text-secondary-text">
            Tu disciplina se está volviendo visible.
          </p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2">
        {labels.map((label, index) => (
          <div className="flex flex-1 flex-col items-center gap-2" key={label}>
            <div
              className={`h-3 w-full rounded-full ${
                index === 0
                  ? "bg-accent shadow-[0_0_24px_var(--accent-glow)]"
                  : "bg-[var(--accent-soft)]"
              }`}
            />
            <span className="text-[0.68rem] font-medium text-secondary-text">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
