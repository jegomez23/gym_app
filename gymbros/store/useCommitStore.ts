"use client";

import { create } from "zustand";
import { mockCommits } from "@/data/mockCommits";
import { getMomentumState } from "@/lib/utils/momentum";
import type {
  Commit,
  CommitFeeling,
  CommitIntensity,
  MomentumState,
  TrainingFocus,
} from "@/types/commit";

type NewCommitInput = {
  trainingFocus: TrainingFocus;
  feeling: CommitFeeling;
  reflection?: string;
};

type CommitStore = {
  commits: Commit[];
  latestCommit: Commit | null;
  momentum: MomentumState;
  addCommit: (input: NewCommitInput) => Commit;
};

function getLocalDateStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getIntensityFromFeeling(feeling: CommitFeeling): CommitIntensity {
  if (feeling === "Strong" || feeling === "Focused" || feeling === "Proud") {
    return "Deep";
  }

  if (feeling === "Tired" || feeling === "Heavy" || feeling === "Survived") {
    return "Light";
  }

  return "Steady";
}

function createCommit(input: NewCommitInput): Commit {
  const reflection = input.reflection?.trim();

  return {
    id: `commit-${Date.now()}`,
    date: getLocalDateStamp(),
    title: `${input.trainingFocus} Commit`,
    note:
      reflection ||
      `Apareciste. Esta sesión quedó guardada como evidencia.`,
    durationMinutes: 0,
    intensity: getIntensityFromFeeling(input.feeling),
    evidence: [input.trainingFocus, input.feeling],
    trainingFocus: input.trainingFocus,
    feeling: input.feeling,
  };
}

export const useCommitStore = create<CommitStore>((set) => {
  const commits = mockCommits;

  return {
    commits,
    latestCommit: commits[0] ?? null,
    momentum: getMomentumState(commits),
    addCommit: (input) => {
      const commit = createCommit(input);

      set((state) => {
        const commits = [commit, ...state.commits];

        return {
          commits,
          latestCommit: commit,
          momentum: getMomentumState(commits),
        };
      });

      return commit;
    },
  };
});
