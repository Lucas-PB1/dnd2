function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}`);
  }
  return value;
}

export function getSupabaseUrl(): string {
  return requireEnv("SUPABASE_URL");
}

export function getSupabasePublishableKey(): string {
  return requireEnv("SUPABASE_PUBLISHABLE_KEY");
}

export function getSiteUrl(): string {
  return process.env.SITE_URL ?? "http://localhost:3000";
}
