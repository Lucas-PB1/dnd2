export type AuthCredentials = {
  email: string;
  password: string;
};

export type SignUpPayload = AuthCredentials & {
  confirmPassword: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type UpdatePasswordPayload = {
  password: string;
  confirmPassword: string;
};

export type AuthResponse = {
  message?: string;
  redirectTo?: string;
};

export type AuthErrorResponse = {
  error: string;
};

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  auth_callback_error: "Não foi possível concluir o login. Tente novamente.",
  auth_confirm_error:
    "Link inválido ou expirado. Solicite um novo e-mail de confirmação.",
  invalid_credentials: "E-mail ou senha incorretos.",
  email_not_confirmed: "Confirme seu e-mail antes de entrar.",
  user_already_exists: "Este e-mail já está cadastrado.",
  weak_password: "A senha deve ter pelo menos 6 caracteres.",
  rate_limit: "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
};

export function translateAuthError(code: string | null): string | null {
  if (!code) return null;
  return AUTH_ERROR_MESSAGES[code] ?? "Ocorreu um erro. Tente novamente.";
}
