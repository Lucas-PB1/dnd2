import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCampaignById } from "@/lib/campaign/server";
import { CampanhaDetailView } from "@/features/campaign";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const campaign = await getCampaignById(Number(id));

  return {
    title: campaign?.name ?? "Campanha",
    description: campaign?.description ?? "Detalhes da campanha",
  };
}

export default async function CampanhaDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    redirect("/entrar");
  }

  const { id } = await params;
  const campaignId = Number(id);

  if (!Number.isInteger(campaignId) || campaignId <= 0) {
    notFound();
  }

  const campaign = await getCampaignById(campaignId);

  if (!campaign) {
    notFound();
  }

  return (
    <CampanhaDetailView
      campaign={{
        ...campaign,
        is_owner: campaign.owner_player_id === claimsData.claims.sub,
      }}
    />
  );
}
