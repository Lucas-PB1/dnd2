import { createClient } from "@/lib/supabase/server";
import { mapSupabaseAuthError } from "@/lib/auth/helpers";
import { jsonError, jsonOk } from "@/lib/api/errors";

type UpdatePasswordBody = {
  password?: string;
  confirmPassword?: string;
};

export async function POST(request: Request) {
  let body: UpdatePasswordBody;

  try {
    body = (await request.json()) as UpdatePasswordBody;
  } catch {
    return jsonError("Corpo da requisição inválido.", 400);
  }

  const password = body.password ?? "";
  const confirmPassword = body.confirmPassword ?? "";

  if (password.length < 6) {
    return jsonError("A senha deve ter pelo menos 6 caracteres.", 400);
  }
  if (password !== confirmPassword) {
    return jsonError("As senhas não coincidem.", 400);
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    return jsonError(
      "Sessão inválida ou expirada. Solicite um novo link de recuperação.",
      401,
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return jsonError(mapSupabaseAuthError(error), 400);
  }

  return jsonOk({
    message: "Senha atualizada com sucesso!",
    redirectTo: "/campanha",
  });
}
