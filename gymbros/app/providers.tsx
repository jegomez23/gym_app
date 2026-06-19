"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState } from "react";

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
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  );
}
