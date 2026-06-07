import { createClient } from "@/lib/supabase/server";
import { GameShell } from "@/features/game";

export default async function GameLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const email =
    typeof claimsData?.claims?.email === "string"
      ? claimsData.claims.email
      : null;

  return <GameShell email={email}>{children}</GameShell>;
}
