"use server";

import { redirect } from "next/navigation";

import { createDomainDataLayer } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

export async function logoutAction() {
  const supabase = await createClient();

  if (supabase) {
    await createDomainDataLayer(supabase).services.auth.signOut();
  }

  redirect("/login");
}
