/**
 * Shared presence (Phase 42) — the smallest expression of "let's both show up."
 * It is NOT a challenge, a streak, a competition, or an accountability tracker.
 * It carries one feeling — "I'm not doing this alone" — and never its opposite,
 * "I can't disappoint them."
 *
 * Like deriveState, selectMemory and describeCadence it is pure, deterministic,
 * explainable, and reads only evidence that already exists. A pact is carried by
 * a `shared_presence` notification (the proposal); whether both people actually
 * appeared is DERIVED here from their commit evidence. Nothing about the pact is
 * persisted beyond the proposal, and a pact simply expires from the window — it
 * is never failed, never mourned.
 */

const MS_PER_HOUR = 1000 * 60 * 60;

/** A pact only lives in the near term — today and a little into tomorrow. */
export const SHARED_PRESENCE_WINDOW_HOURS = 36;

/** A received shared_presence proposal, from the recipient's point of view. */
export type SharedPresenceProposal = {
  /** The notification id — used to acknowledge (accept) the proposal. */
  notificationId: string;
  /** The person who proposed (the notification's actor). */
  partnerId: string;
  partnerName: string;
  /** Acknowledged by the recipient — i.e. accepted. */
  accepted: boolean;
  createdAt: string;
};

export type SharedPresenceInput = {
  proposals: SharedPresenceProposal[];
  /** The recipient's own most recent commit. */
  selfLastCommitAt: string | null;
  /** Each partner's most recent commit, by partner id (from circle presence). */
  partnerLastCommitAt: Record<string, string | null>;
  now?: Date;
};

/** An invitation not yet accepted — the only one that asks anything of the user. */
export type PendingPresence = {
  notificationId: string;
  partnerId: string;
  partnerName: string;
};

/** An accepted pact, resolved purely from who has left evidence since it began. */
export type ActivePresence = {
  partnerId: string;
  partnerName: string;
  selfAppeared: boolean;
  partnerAppeared: boolean;
  /** together = both appeared; almost = one of two; waiting = neither yet. */
  status: "together" | "almost" | "waiting";
};

export type SharedPresence = {
  pending: PendingPresence[];
  active: ActivePresence[];
};

function appearedSince(lastCommitAt: string | null, anchor: number): boolean {
  if (!lastCommitAt) {
    return false;
  }
  const at = new Date(lastCommitAt).getTime();
  return !Number.isNaN(at) && at >= anchor;
}

/**
 * Resolve the recipient's live shared-presence pacts. Only proposals inside the
 * window count; everything older has quietly expired.
 */
export function deriveSharedPresence(
  input: SharedPresenceInput
): SharedPresence {
  const now = (input.now ?? new Date()).getTime();
  const windowStart = now - SHARED_PRESENCE_WINDOW_HOURS * MS_PER_HOUR;

  const live = input.proposals.filter((proposal) => {
    const created = new Date(proposal.createdAt).getTime();
    return !Number.isNaN(created) && created >= windowStart;
  });

  const pending: PendingPresence[] = [];
  const active: ActivePresence[] = [];

  for (const proposal of live) {
    if (!proposal.accepted) {
      pending.push({
        notificationId: proposal.notificationId,
        partnerId: proposal.partnerId,
        partnerName: proposal.partnerName,
      });
      continue;
    }

    const anchor = new Date(proposal.createdAt).getTime();
    const selfAppeared = appearedSince(input.selfLastCommitAt, anchor);
    const partnerAppeared = appearedSince(
      input.partnerLastCommitAt[proposal.partnerId] ?? null,
      anchor
    );

    const status: ActivePresence["status"] =
      selfAppeared && partnerAppeared
        ? "together"
        : selfAppeared || partnerAppeared
          ? "almost"
          : "waiting";

    active.push({
      partnerId: proposal.partnerId,
      partnerName: proposal.partnerName,
      selfAppeared,
      partnerAppeared,
      status,
    });
  }

  return { pending, active };
}
