import type { Json, Tables } from "@/supabase/types/database.generated";

import type {
  CircleMembership,
  CirclePresence,
  Commit,
  CommitDetail,
  Evidence,
  JourneyItem,
  Notification,
  Profile,
  ProgressSummary,
  Reflection,
  SharedHistory,
  Support,
} from "./types";

type CirclePresenceRow = {
  member_id: string;
  member_name: string;
  member_avatar_url: string | null;
  last_commit_id: string | null;
  last_commit_title: string | null;
  last_commit_recorded_at: string | null;
  active_commit_count: number;
};

type JourneyTimelineRow = {
  commit_id: string;
  user_id: string;
  title: string | null;
  type: string | null;
  recorded_at: string;
  duration_minutes: number | null;
  intensity: Commit["intensity"];
  note: string | null;
  visibility: Commit["visibility"];
  evidence: Json;
  reflections: Json;
};

type SharedHistoryRow = {
  other_profile_id: string;
  joined_at: string;
  days_connected: number;
  shared_commit_count: number;
  supports_sent: number;
  supports_received: number;
  recent_commits: Json;
  recent_supports: Json;
};

type ProgressSummaryRow = {
  profile_id: string;
  total_commits: number;
  active_days: number;
  first_commit_at: string | null;
  last_commit_at: string | null;
};

type CommitDetailRow = JourneyTimelineRow & {
  profile: Json;
  created_at: string;
};

export function toEvidence(value: Json): Evidence {
  return Array.isArray(value) ? value : [];
}

export function mapProfile(row: Tables<"profiles">): Profile {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    identityStatement: row.identity_statement,
    chapter: row.chapter,
    visibilityPreference: row.visibility_preference,
    onboardingCompleted: row.onboarding_completed,
    timezone: row.timezone,
    locale: row.locale,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export function mapCommit(row: Tables<"commits">): Commit {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    type: row.type,
    recordedAt: row.recorded_at,
    durationMinutes: row.duration_minutes,
    intensity: row.intensity,
    note: row.note,
    visibility: row.visibility,
    evidence: toEvidence(row.evidence),
    chapter: row.chapter,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
  };
}

export function mapReflection(row: Tables<"reflections">): Reflection {
  return {
    id: row.id,
    userId: row.user_id,
    commitId: row.commit_id,
    content: row.content,
    type: row.type,
    visibility: row.visibility,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export function mapCircleMembership(
  row: Tables<"circle_memberships">
): CircleMembership {
  return {
    id: row.id,
    userId: row.user_id,
    circleUserId: row.circle_user_id,
    status: row.status,
    invitedBy: row.invited_by ?? null,
    joinedAt: row.joined_at,
    endedAt: row.ended_at,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
  };
}

export function mapSupport(row: Tables<"supports">): Support {
  return {
    id: row.id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    message: row.message,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
  };
}

export function mapNotification(row: Tables<"notifications">): Notification {
  return {
    id: row.id,
    recipientUserId: row.recipient_user_id,
    actorUserId: row.actor_user_id,
    type: row.type,
    entityType: row.entity_type,
    entityId: row.entity_id,
    message: row.message,
    readAt: row.read_at,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
  };
}

export function mapCirclePresence(row: CirclePresenceRow): CirclePresence {
  return {
    memberId: row.member_id,
    memberName: row.member_name,
    memberAvatarUrl: row.member_avatar_url,
    lastCommitId: row.last_commit_id,
    lastCommitTitle: row.last_commit_title,
    lastCommitRecordedAt: row.last_commit_recorded_at,
    activeCommitCount: row.active_commit_count,
  };
}

export function mapJourneyItem(row: JourneyTimelineRow): JourneyItem {
  return {
    id: row.commit_id,
    userId: row.user_id,
    title: row.title,
    type: row.type,
    recordedAt: row.recorded_at,
    durationMinutes: row.duration_minutes,
    intensity: row.intensity,
    note: row.note,
    visibility: row.visibility,
    evidence: toEvidence(row.evidence),
    // The journey RPC does not carry chapter; the Archive resolves a commit's season
    // from listCommitsForProfile instead. Null here keeps the type honest.
    chapter: null,
    createdAt: row.recorded_at,
    deletedAt: null,
    reflections: parseReflectionSummaries(row.reflections),
  };
}

export function mapSharedHistory(row: SharedHistoryRow): SharedHistory {
  return {
    otherProfileId: row.other_profile_id,
    joinedAt: row.joined_at,
    daysConnected: row.days_connected,
    sharedCommitCount: row.shared_commit_count,
    supportsSent: row.supports_sent,
    supportsReceived: row.supports_received,
    recentCommits: toEvidence(row.recent_commits),
    recentSupports: toEvidence(row.recent_supports),
  };
}

export function mapProgressSummary(row: ProgressSummaryRow): ProgressSummary {
  return {
    profileId: row.profile_id,
    totalCommits: row.total_commits,
    activeDays: row.active_days,
    firstCommitAt: row.first_commit_at,
    lastCommitAt: row.last_commit_at,
  };
}

export function mapCommitDetail(row: CommitDetailRow): CommitDetail {
  return {
    id: row.commit_id,
    userId: row.user_id,
    profile: parseCommitProfile(row.profile),
    title: row.title,
    type: row.type,
    recordedAt: row.recorded_at,
    durationMinutes: row.duration_minutes,
    intensity: row.intensity,
    note: row.note,
    visibility: row.visibility,
    evidence: toEvidence(row.evidence),
    chapter: null,
    createdAt: row.created_at,
    deletedAt: null,
    reflections: parseReflectionSummaries(row.reflections),
  };
}

function parseCommitProfile(value: Json): CommitDetail["profile"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { id: "", name: "", avatarUrl: null };
  }

  return {
    id: typeof value.id === "string" ? value.id : "",
    name: typeof value.name === "string" ? value.name : "",
    avatarUrl: typeof value.avatar_url === "string" ? value.avatar_url : null,
  };
}

function parseReflectionSummaries(value: Json): JourneyItem["reflections"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return [];
    }

    const id = item.id;
    const content = item.content;
    const visibility = item.visibility;
    const createdAt = item.created_at;
    const updatedAt = item.updated_at;

    if (
      typeof id !== "string" ||
      typeof content !== "string" ||
      (visibility !== "private" && visibility !== "circle") ||
      typeof createdAt !== "string" ||
      typeof updatedAt !== "string"
    ) {
      return [];
    }

    const type =
      item.type === "technical" ||
      item.type === "emotional" ||
      item.type === "identity" ||
      item.type === "process"
        ? item.type
        : null;

    return [
      {
        id,
        content,
        type,
        visibility,
        createdAt,
        updatedAt,
      },
    ];
  });
}
