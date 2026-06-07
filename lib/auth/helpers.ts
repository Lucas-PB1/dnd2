import type { AuthError } from "@supabase/supabase-js";

export function mapSupabaseAuthError(error: AuthError): string {
  switch (error.message) {
    case "Invalid login credentials":
      return "E-mail ou senha incorretos.";
    case "Email not confirmed":
      return "Confirme seu e-mail antes de entrar.";
    case "User already registered":
      return "Este e-mail já está cadastrado.";
    case "Password should be at least 6 characters":
      return "A senha deve ter pelo menos 6 caracteres.";
    case "For security purposes, you can only request this after 60 seconds.":
      return "Aguarde um minuto antes de solicitar novamente.";
    default:
      if (error.status === 429) {
        return "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
      }
      return error.message;
  }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function sanitizeRedirectPath(next: string | null, fallback = "/campanha"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}
