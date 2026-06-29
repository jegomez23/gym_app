import "server-only";

import { requireProfile } from "@/lib/auth/session";
import type { Commit } from "@/lib/dal";

export type PublicDocument = {
  commit: Commit;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
};

const EXPLORE_LIMIT = 30;

/**
 * Explore is a finite, calm library — not a feed. A single bounded read of the
 * world's public documentation, attributed to its author. Two opt-ins are required
 * for anything to appear: the commit must be public (RLS) and the author's profile
 * must be public (profiles_select_public, Phase 54). A public document whose author
 * chose not to be discoverable is silently omitted rather than shown anonymously —
 * attribution is the point, and a faceless card is not.
 */
export async function getExploreViewModel() {
  const context = await requireProfile();

  const commits =
    await context.data.services.commits.listRecentPublicCommits(EXPLORE_LIMIT);

  const authorIds = [...new Set(commits.map((commit) => commit.userId))];
  const authors =
    await context.data.services.profiles.listProfilesByIds(authorIds);
  const authorById = new Map(authors.map((author) => [author.id, author]));

  const documents: PublicDocument[] = commits.flatMap((commit) => {
    const author = authorById.get(commit.userId);
    if (!author) {
      return [];
    }

    return [
      {
        commit,
        author: {
          id: author.id,
          name: author.name,
          avatarUrl: author.avatarUrl,
        },
      },
    ];
  });

  return {
    status: "ready" as const,
    documents,
  };
}
