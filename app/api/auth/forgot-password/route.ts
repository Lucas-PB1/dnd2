import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/env";
import { isValidEmail, mapSupabaseAuthError } from "@/lib/auth/helpers";
import { jsonError, jsonOk } from "@/lib/api/errors";

type ForgotPasswordBody = {
  email?: string;
};

export async function POST(request: Request) {
  let body: ForgotPasswordBody;

  try {
    body = (await request.json()) as ForgotPasswordBody;
  } catch {
    return jsonError("Corpo da requisição inválido.", 400);
  }

  const email = body.email?.trim() ?? "";

  if (!isValidEmail(email)) {
    return jsonError("Informe um e-mail válido.", 400);
  }

  const supabase = await createClient();
  const siteUrl = getSiteUrl();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/redefinir-senha`,
  });

  if (error) {
    return jsonError(mapSupabaseAuthError(error), 400);
  }

  return jsonOk({
    message:
      "Se o e-mail existir em nossa base, você receberá um link para redefinir a senha.",
  });
}
