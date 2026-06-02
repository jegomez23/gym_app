export type MomentumState = "High" | "Base" | "Recovering";

export type CommitIntensity = "Light" | "Steady" | "Deep";

export type TrainingFocus =
  | "Push"
  | "Pull"
  | "Legs"
  | "Upper"
  | "Lower"
  | "Full Body"
  | "Cardio"
  | "Mobility"
  | "Sport"
  | "Other";

export type CommitFeeling =
  | "Strong"
  | "Focused"
  | "Tired"
  | "Heavy"
  | "Calm"
  | "Proud"
  | "Survived"
  | "Returning";

export type Commit = {
  id: string;
  date: string;
  title: string;
  note: string;
  durationMinutes: number;
  intensity: CommitIntensity;
  evidence: string[];
  trainingFocus?: TrainingFocus;
  feeling?: CommitFeeling;
};
