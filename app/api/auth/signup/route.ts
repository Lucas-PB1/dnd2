import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/env";
import { isValidEmail, mapSupabaseAuthError } from "@/lib/auth/helpers";
import { jsonError, jsonOk } from "@/lib/api/errors";

type SignUpBody = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export async function POST(request: Request) {
  let body: SignUpBody;

  try {
    body = (await request.json()) as SignUpBody;
  } catch {
    return jsonError("Corpo da requisição inválido.", 400);
  }

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";
  const confirmPassword = body.confirmPassword ?? "";

  if (!isValidEmail(email)) {
    return jsonError("Informe um e-mail válido.", 400);
  }
  if (password.length < 6) {
    return jsonError("A senha deve ter pelo menos 6 caracteres.", 400);
  }
  if (password !== confirmPassword) {
    return jsonError("As senhas não coincidem.", 400);
  }

  const supabase = await createClient();
  const siteUrl = getSiteUrl();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/campanha`,
    },
  });

  if (error) {
    return jsonError(mapSupabaseAuthError(error), 400);
  }

  if (data.user && !data.session) {
    return jsonOk({
      message:
        "Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.",
    });
  }

  return jsonOk({
    message: "Conta criada com sucesso!",
    redirectTo: "/campanha",
  });
}
