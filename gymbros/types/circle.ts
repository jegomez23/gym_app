import type { CommitFeeling, TrainingFocus } from "@/types/commit";

export type CircleMember = {
  id: string;
  name: string;
  initials: string;
  trainedToday: boolean;
};

export type SupportReaction = "Respect" | "Keep Going" | "Proud of You";

export type CircleActivity = {
  id: string;
  memberName: string;
  initials: string;
  committedAt: string;
  trainingFocus: TrainingFocus;
  feeling?: CommitFeeling;
  message: string;
};
