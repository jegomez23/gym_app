import type { CircleActivity } from "@/types/circle";

function parseActivityDate(date: string) {
  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getCircleCommitsThisWeek(activity: CircleActivity[]) {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const day = startOfToday.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() + mondayOffset);

  return activity.filter((item) => {
    const committedAt = parseActivityDate(item.committedAt);

    return Boolean(committedAt && committedAt >= startOfWeek);
  });
}

export function getRelativeActivityTime(date: string) {
  const committedAt = parseActivityDate(date);

  if (!committedAt) {
    return date;
  }

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfActivityDay = new Date(
    committedAt.getFullYear(),
    committedAt.getMonth(),
    committedAt.getDate(),
  );
  const diffMs = now.getTime() - committedAt.getTime();
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfActivityDay.getTime()) / 86_400_000,
  );

  if (diffHours >= 1 && diffHours < 24) {
    return `hace ${diffHours} h`;
  }

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
  }).format(committedAt);
}
