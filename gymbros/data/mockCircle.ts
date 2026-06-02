import type { CircleActivity, CircleMember } from "@/types/circle";

export const mockCircleMembers: CircleMember[] = [
  { id: "member-001", name: "Mara", initials: "MA", trainedToday: true },
  { id: "member-002", name: "Noah", initials: "NO", trainedToday: true },
  { id: "member-003", name: "Iris", initials: "IR", trainedToday: false },
  { id: "member-004", name: "Leo", initials: "LE", trainedToday: true },
];

export const mockCircleActivity: CircleActivity[] = [
  {
    id: "activity-001",
    memberName: "Mara",
    initials: "MA",
    committedAt: "2026-06-02T07:42:00",
    trainingFocus: "Mobility",
    feeling: "Calm",
    message: "Registró una sesión tranquila por la mañana.",
  },
  {
    id: "activity-002",
    memberName: "Noah",
    initials: "NO",
    committedAt: "2026-06-02T12:18:00",
    trainingFocus: "Upper",
    feeling: "Focused",
    message: "Protegió el ritmo con una sesión breve.",
  },
  {
    id: "activity-003",
    memberName: "Leo",
    initials: "LE",
    committedAt: "2026-06-01T18:05:00",
    trainingFocus: "Full Body",
    feeling: "Proud",
    message: "Cerró el día con trabajo constante.",
  },
];
