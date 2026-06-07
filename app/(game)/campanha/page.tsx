import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listCampaigns } from "@/lib/campaign/server";
import { CampanhaView } from "@/features/campaign";

export const metadata: Metadata = {
  title: "Campanhas",
  description: "Suas campanhas de D&D 2024",
};

export default async function CampanhaPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    redirect("/entrar");
  }

  const userId = claimsData.claims.sub;
  const email =
    typeof claimsData.claims.email === "string"
      ? claimsData.claims.email
      : "aventureiro";

  let campaigns: Awaited<ReturnType<typeof listCampaigns>> = [];

  try {
    campaigns = await listCampaigns();
  } catch {
    campaigns = [];
  }

  return (
    <CampanhaView
      email={email}
      userId={userId}
      initialCampaigns={campaigns}
    />
  );
}
