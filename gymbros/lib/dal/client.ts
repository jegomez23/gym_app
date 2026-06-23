import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/supabase/types/database.generated";

import { InfrastructureError } from "./errors";

export type DomainDataClient = SupabaseClient<Database>;

export function requireDomainDataClient(
  client: DomainDataClient | null
): DomainDataClient {
  if (!client) {
    throw new InfrastructureError("Supabase is not configured");
  }

  return client;
}
