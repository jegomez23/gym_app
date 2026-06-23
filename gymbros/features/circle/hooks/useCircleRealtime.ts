"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSupabase } from "@/app/providers";

export function useCircleRealtime(profileId: string) {
  const router = useRouter();
  const supabase = useSupabase();

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel(`circle:${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "circle_memberships",
          filter: `user_id=eq.${profileId}`,
        },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "supports",
          filter: `to_user_id=eq.${profileId}`,
        },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "supports",
          filter: `from_user_id=eq.${profileId}`,
        },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [profileId, router, supabase]);
}
