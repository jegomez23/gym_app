import type { Json } from "@/supabase/types/database.generated";

export type ProfileVisibility = "private" | "circle" | "public";
export type CommitVisibility = "private" | "circle" | "public";
export type ReflectionVisibility = "private" | "circle";
export type CommitIntensity = "light" | "steady" | "deep";
export type ReflectionType = "technical" | "emotional" | "identity" | "process";
export type CircleMembershipStatus = "pending" | "active" | "paused" | "ended";
export type NotificationType =
  | "support_received"
  | "circle_invitation"
  | "invitation_accepted"
  | "reflection_received";
export type NotificationEntityType =
  | "support"
  | "circle_membership"
  | "reflection"
  | "commit";

export type Evidence = Json[];

export type Profile = {
  id: string;
  username: string | null;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  visibilityPreference: ProfileVisibility;
  onboardingCompleted: boolean;
  timezone: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Commit = {
  id: string;
  userId: string;
  title: string | null;
  type: string | null;
  recordedAt: string;
  durationMinutes: number | null;
  intensity: CommitIntensity | null;
  note: string | null;
  visibility: CommitVisibility;
  evidence: Evidence;
  createdAt: string;
  deletedAt: string | null;
};

export type Reflection = {
  id: string;
  userId: string;
  commitId: string;
  content: string;
  type: ReflectionType | null;
  visibility: ReflectionVisibility;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type CircleMembership = {
  id: string;
  userId: string;
  circleUserId: string;
  status: CircleMembershipStatus;
  invitedBy: string | null;
  joinedAt: string;
  endedAt: string | null;
  createdAt: string;
  deletedAt: string | null;
};

export type Support = {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  createdAt: string;
  deletedAt: string | null;
};

export type Notification = {
  id: string;
  recipientUserId: string;
  actorUserId: string | null;
  type: NotificationType;
  entityType: NotificationEntityType | null;
  entityId: string | null;
  message: string;
  readAt: string | null;
  createdAt: string;
  deletedAt: string | null;
};

export type CirclePresence = {
  memberId: string;
  memberName: string;
  memberAvatarUrl: string | null;
  lastCommitId: string | null;
  lastCommitTitle: string | null;
  lastCommitRecordedAt: string | null;
  activeCommitCount: number;
};

export type JourneyItem = Commit & {
  reflections: Array<
    Pick<
      Reflection,
      "id" | "content" | "type" | "visibility" | "createdAt" | "updatedAt"
    >
  >;
};

export type SharedHistory = {
  otherProfileId: string;
  joinedAt: string;
  daysConnected: number;
  sharedCommitCount: number;
  supportsSent: number;
  supportsReceived: number;
  recentCommits: Json[];
  recentSupports: Json[];
};

export type ProgressSummary = {
  profileId: string;
  totalCommits: number;
  activeDays: number;
  firstCommitAt: string | null;
  lastCommitAt: string | null;
};

export type CommitDetail = Commit & {
  profile: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  reflections: JourneyItem["reflections"];
};

export type PaginationOptions = {
  limit?: number;
  before?: string | null;
};

export type DateRange = {
  from?: string;
  to?: string;
};
