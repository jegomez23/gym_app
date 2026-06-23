"use client";

import { useCircleRealtime } from "../hooks/useCircleRealtime";

type CircleRealtimeClientProps = {
  profileId: string;
};

export function CircleRealtimeClient({ profileId }: CircleRealtimeClientProps) {
  useCircleRealtime(profileId);

  return null;
}
