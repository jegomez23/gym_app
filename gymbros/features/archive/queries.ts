import "server-only";

import { requireProfile } from "@/lib/auth/session";
import type { JourneyItem } from "@/lib/dal";
import { describeCadence } from "@/lib/process/describeCadence";

// A life in movement is lived in seasons, not as a flat stream. A season is a
// contiguous run of evidence made within the same chapter (the user's own words);
// null is the season-less evidence (no chapter set, or made before chapters existed).
export type ArchiveSeason = { chapter: string | null; items: JourneyItem[] };

function groupIntoSeasons(
  items: JourneyItem[],
  chapterById: Map<string, string | null>
): ArchiveSeason[] {
  const seasons: ArchiveSeason[] = [];

  for (const item of items) {
    const chapter = chapterById.get(item.id) ?? null;
    const current = seasons.at(-1);

    if (current && current.chapter === chapter) {
      current.items.push(item);
    } else {
      seasons.push({ chapter, items: [item] });
    }
  }

  return seasons;
}

export async function getArchiveViewModel() {
  const context = await requireProfile();

  // The journey carries the evidence and its reflections (for the cards); the plain
  // commit list carries each piece's chapter (the journey RPC does not). Same bounded
  // window, same order — joined by id to tell the record as the seasons it was lived in.
  const [journey, commits, progress] = await Promise.all([
    context.data.services.journey.getJourney(context.profile.id, {
      limit: 30,
    }),
    context.data.services.commits.listCommitsForProfile(context.profile.id, {
      limit: 30,
    }),
    context.data.services.journey.getProgressSummary(context.profile.id),
  ]);

  // The one quiet signal of process: what this evidence reveals about the rhythm
  // of the practice — in words, never a number. Null (silence) until honest.
  const cadence = describeCadence({
    totalCommits: progress.totalCommits,
    activeDays: progress.activeDays,
    firstCommitAt: progress.firstCommitAt,
  });

  const chapterById = new Map(
    commits.map((commit) => [commit.id, commit.chapter])
  );

  return {
    status: "ready" as const,
    seasons: groupIntoSeasons(journey, chapterById),
    cadence,
  };
}
