import { createAuthedClient } from "@/lib/api/require-user";
import { CAMPAIGN_SELECT, mapCampaignRow } from "@/lib/campaign/map-row";
import type { Campaign } from "@/shared/campaign";

export async function listCampaigns(): Promise<Campaign[]> {
  const { supabase } = await createAuthedClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select(CAMPAIGN_SELECT)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapCampaignRow);
}

export async function getCampaignById(id: number) {
  const { supabase } = await createAuthedClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select(CAMPAIGN_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapCampaignRow(data) : null;
}
