import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/env";

function getSupabaseSecretKey(): string {
  const value = process.env.SUPABASE_SECRET_KEY;
  if (!value) {
    throw new Error("Variável de ambiente ausente: SUPABASE_SECRET_KEY");
  }
  return value;
}

/** Service role — só em Route Handlers após validar o usuário. */
export function createAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseSecretKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
