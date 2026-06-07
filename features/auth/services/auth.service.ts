export function startGoogleLogin(next?: string): void {
  const params = next ? `?next=${encodeURIComponent(next)}` : "";
  window.location.href = `/api/auth/google${params}`;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/entrar";
}
