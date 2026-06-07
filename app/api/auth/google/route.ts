import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/env";
import { sanitizeRedirectPath } from "@/lib/auth/helpers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = sanitizeRedirectPath(searchParams.get("next"));
  const siteUrl = getSiteUrl();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(
      `${siteUrl}/entrar?error=auth_callback_error`,
    );
  }

  return NextResponse.redirect(data.url);
}
