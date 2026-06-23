"use client";

import { createContext, useContext, useMemo } from "react";

import { createClient } from "@/lib/supabase/client";

type SupabaseClient = ReturnType<typeof createClient>;

const SupabaseContext = createContext<SupabaseClient>(null);

export function useSupabase() {
  return useContext(SupabaseContext);
}

function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </SupabaseProvider>
  );
}
