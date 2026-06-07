import { createClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/api/errors";
import type { SupabaseClient } from "@supabase/supabase-js";

async function assertAuthenticated(
  supabase: SupabaseClient,
): Promise<string> {
  // Lazy init (@supabase/ssr): carrega sessão antes de queries PostgREST.
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session?.access_token) {
    throw new ApiError("Não autenticado.", 401);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.id) {
    throw new ApiError("Não autenticado.", 401);
  }

  return user.id;
}

export async function createAuthedClient() {
  const supabase = await createClient();
  const userId = await assertAuthenticated(supabase);
  return { supabase, userId };
}

export async function requireUserId(): Promise<string> {
  const { userId } = await createAuthedClient();
  return userId;
}
