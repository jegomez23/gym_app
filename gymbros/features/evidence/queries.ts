import "server-only";

import { requireProfile } from "@/lib/auth/session";
import { NotFoundError } from "@/lib/dal/errors";

/**
 * A single piece of evidence, opened as a document — the experience preserved,
 * not just the fact that it happened. Reuses the already-built `get_commit_detail`
 * RPC (commit + author + its reflections), which had no surface until now. RLS is
 * the authorization boundary: `get_commit_detail` is security-invoker, so a commit
 * the viewer cannot see returns empty → NotFoundError → a 404, never a leak.
 */
export async function getDocumentViewModel(commitId: string) {
  const context = await requireProfile();

  try {
    const document =
      await context.data.services.commits.getCommitDetail(commitId);

    return {
      status: "ready" as const,
      document,
      isOwner: document.userId === context.profile.id,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { status: "not_found" as const };
    }

    throw error;
  }
}
