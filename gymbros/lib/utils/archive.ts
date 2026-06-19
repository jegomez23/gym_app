import type { Commit, CommitFeeling } from "@/types/commit";

function parseCommitDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getRelativeCommitDate(date: string) {
  const commitDate = parseCommitDate(date);

  if (!commitDate) {
    return date;
  }

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const diffMs = todayStart.getTime() - commitDate.getTime();
  const diffDays = Math.round(diffMs / 86_400_000);

  if (diffDays === 0) {
    return "Hoy";
  }

  if (diffDays === 1) {
    return "Ayer";
  }

  if (diffDays > 1 && diffDays < 7) {
    return `hace ${diffDays} días`;
  }

  return new Intl.DateTimeFormat("es", {
    month: "short",
    day: "numeric",
  }).format(commitDate);
}

export function getCommitsThisWeek(commits: Commit[]) {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const day = startOfToday.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() + mondayOffset);

  return commits.filter((commit) => {
    const commitDate = parseCommitDate(commit.date);

    return Boolean(commitDate && commitDate >= startOfWeek);
  });
}

export function getLatestFeeling(commits: Commit[]): CommitFeeling | string {
  return commits[0]?.feeling ?? commits[0]?.intensity ?? "Sin registro";
}

export function sortCommitsNewestFirst(commits: Commit[]) {
  return [...commits].sort(
    (first, second) =>
      new Date(second.date).getTime() - new Date(first.date).getTime()
  );
}
