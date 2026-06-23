"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSupabase } from "@/app/providers";

export function useNotificationsRealtime(profileId: string) {
  const router = useRouter();
  const supabase = useSupabase();

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel(`notifications:${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `recipient_user_id=eq.${profileId}`,
        },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [profileId, router, supabase]);
}
