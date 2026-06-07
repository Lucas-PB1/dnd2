import { createClient } from "@/lib/supabase/server";
import { jsonOk } from "@/lib/api/errors";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return jsonOk({ redirectTo: "/entrar" });
}
