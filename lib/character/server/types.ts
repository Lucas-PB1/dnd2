import type { SupabaseClient } from "@supabase/supabase-js";
import type { createAdminClient } from "@/lib/supabase/admin";

export type CharacterAdminClient = ReturnType<typeof createAdminClient>;
export type AuthenticatedSheetClient = Pick<SupabaseClient, "rpc">;
