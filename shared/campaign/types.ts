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

export type CampaignInviteRole = "Player" | "Dungeon Master" | "Spectator";

export const INVITEABLE_ROLES: CampaignInviteRole[] = [
  "Player",
  "Dungeon Master",
  "Spectator",
];

export const DEFAULT_INVITE_ROLE: CampaignInviteRole = "Player";

export const INVITE_ROLE_LABELS: Record<CampaignInviteRole, string> = {
  Player: "Jogador",
  "Dungeon Master": "Mestre",
  Spectator: "Espectador",
};

export type CampaignMember = {
  player_id: string;
  username: string;
  display_name: string | null;
  email: string | null;
  role_name: string | null;
  is_owner: boolean;
};

export type InviteMemberPayload = {
  email: string;
  role?: CampaignInviteRole;
};

export type CampaignMembersResponse = {
  members: CampaignMember[];
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
