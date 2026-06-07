import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerCookieClient } from "@/lib/supabase/server";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/env";
import { ApiError } from "@/lib/api/errors";

/**
 * Cliente Supabase com JWT do usuário fixo no PostgREST.
 * O createServerClient (@supabase/ssr) valida auth via cookies, mas o fetch
 * das queries pode cair na publishable key (role anon) sem accessToken explícito.
 */
export async function createAuthedClient() {
  const cookieClient = await createServerCookieClient();

  const {
    data: { session },
    error: sessionError,
  } = await cookieClient.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new ApiError("Não autenticado.", 401);
  }

  const {
    data: { user },
    error: userError,
  } = await cookieClient.auth.getUser();

  if (userError || !user?.id) {
    throw new ApiError("Não autenticado.", 401);
  }

  const accessToken = session.access_token;

  const supabase = createSupabaseClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      accessToken: async () => accessToken,
    },
  );

  return { supabase, userId: user.id };
}

export async function requireUserId(): Promise<string> {
  const { userId } = await createAuthedClient();
  return userId;
}
