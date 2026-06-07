export type Campaign = {
  id: number;
  name: string;
  description: string | null;
  owner_player_id: string;
  created_at: string;
  updated_at: string;
  member_count: number;
};

export type CampaignDetail = Campaign & {
  is_owner: boolean;
};

export type CreateCampaignPayload = {
  name: string;
  description?: string;
};

export type CampaignListResponse = {
  campaigns: Campaign[];
};

export type CampaignErrorResponse = {
  error: string;
};

export const CAMPAIGN_NAME_MIN = 2;
export const CAMPAIGN_NAME_MAX = 255;
