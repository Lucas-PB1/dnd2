import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CampanhaView } from "@/features/campaign";

export const metadata: Metadata = {
  title: "Campanhas",
  description: "Suas campanhas de D&D 2024",
};

export default async function CampanhaPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const email =
    typeof claimsData?.claims?.email === "string"
      ? claimsData.claims.email
      : "aventureiro";

  return <CampanhaView email={email} />;
}
