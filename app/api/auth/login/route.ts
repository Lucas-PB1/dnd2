import { createClient } from "@/lib/supabase/server";
import { isValidEmail, mapSupabaseAuthError } from "@/lib/auth/helpers";
import { jsonError, jsonOk } from "@/lib/api/errors";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  let body: LoginBody;

  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return jsonError("Corpo da requisição inválido.", 400);
  }

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!isValidEmail(email)) {
    return jsonError("Informe um e-mail válido.", 400);
  }
  if (!password) {
    return jsonError("Informe sua senha.", 400);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return jsonError(mapSupabaseAuthError(error), 401);
  }

  return jsonOk({ redirectTo: "/campanha" });
}
