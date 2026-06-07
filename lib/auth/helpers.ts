export function sanitizeRedirectPath(next: string | null, fallback = "/campanha"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}
