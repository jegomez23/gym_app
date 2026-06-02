"use client";

import { create } from "zustand";
import { mockCircleActivity, mockCircleMembers } from "@/data/mockCircle";
import type {
  CircleActivity,
  CircleMember,
  SupportReaction,
} from "@/types/circle";

type CircleStore = {
  circleName: string;
  members: CircleMember[];
  activity: CircleActivity[];
  reactions: Record<string, SupportReaction>;
  trainedTodayCount: number;
  setReaction: (activityId: string, reaction: SupportReaction) => void;
};

export const useCircleStore = create<CircleStore>((set) => {
  const members = mockCircleMembers;

  return {
    circleName: "Quiet Strength",
    members,
    activity: mockCircleActivity,
    reactions: {},
    trainedTodayCount: members.filter((member) => member.trainedToday).length,
    setReaction: (activityId, reaction) => {
      set((state) => ({
        reactions: {
          ...state.reactions,
          [activityId]: reaction,
        },
      }));
    },
  };
});
