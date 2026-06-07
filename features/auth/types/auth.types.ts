export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  auth_callback_error: "Não foi possível concluir o login. Tente novamente.",
};

export function translateAuthError(code: string | null): string | null {
  if (!code) return null;
  return AUTH_ERROR_MESSAGES[code] ?? "Ocorreu um erro. Tente novamente.";
}
