import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/api/errors";
import { CAMPAIGN_BASE_SELECT, mapCampaignRow } from "@/lib/campaign/map-row";
import type { Campaign } from "@/features/campaign/types/campaign.types";

export async function loadCampaign(campaignId: number): Promise<Campaign | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("campaigns")
    .select(CAMPAIGN_BASE_SELECT)
    .eq("id", campaignId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapCampaignRow(data);
}

export async function assertCampaignMember(
  campaignId: number,
  userId: string,
): Promise<{ campaign: Campaign; isOwner: boolean }> {
  const campaign = await loadCampaign(campaignId);

  if (!campaign) {
    throw new ApiError("Campanha não encontrada.", 404);
  }

  if (campaign.owner_player_id === userId) {
    return { campaign, isOwner: true };
  }

  const admin = createAdminClient();
  const { data: membership } = await admin
    .from("player_campaigns")
    .select("player_id")
    .eq("campaign_id", campaignId)
    .eq("player_id", userId)
    .maybeSingle();

  if (!membership) {
    throw new ApiError("Campanha não encontrada.", 404);
  }

  return { campaign, isOwner: false };
}

export async function assertCampaignOwner(
  campaignId: number,
  userId: string,
): Promise<Campaign> {
  const { campaign, isOwner } = await assertCampaignMember(campaignId, userId);

  if (!isOwner) {
    throw new ApiError("Somente o dono da campanha pode fazer isso.", 403);
  }

  return campaign;
}
