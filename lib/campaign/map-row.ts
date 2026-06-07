import type { Campaign } from "@/features/campaign/types/campaign.types";

type CampaignRow = {
  id: number;
  name: string;
  description: string | null;
  owner_player_id: string;
  created_at: string;
  updated_at: string;
  player_campaigns?: { count: number }[];
};

export function mapCampaignRow(row: CampaignRow): Campaign {
  const memberCount = row.player_campaigns?.[0]?.count ?? 0;

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    owner_player_id: row.owner_player_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    member_count: memberCount,
  };
}

export const CAMPAIGN_SELECT = `
  id,
  name,
  description,
  owner_player_id,
  created_at,
  updated_at,
  player_campaigns ( count )
` as const;
