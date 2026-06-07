import type { CampaignMember } from "@/features/campaign/types/campaign.types";

type PlayerRow = {
  id: string;
  username: string;
  display_name: string | null;
  email: string | null;
};

export type MembershipRow = {
  player_id: string;
  roles: { name: string } | { name: string }[] | null;
  players: PlayerRow | PlayerRow[] | null;
};

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapPlayerToMember(
  player: PlayerRow,
  roleName: string | null,
  isOwner: boolean,
): CampaignMember {
  return {
    player_id: player.id,
    username: player.username,
    display_name: player.display_name,
    email: player.email,
    role_name: roleName,
    is_owner: isOwner,
  };
}

export function buildMembersList(
  owner: PlayerRow,
  memberships: MembershipRow[],
): CampaignMember[] {
  const members: CampaignMember[] = [
    mapPlayerToMember(owner, "Owner", true),
  ];

  for (const row of memberships) {
    const player = unwrapOne(row.players);
    const role = unwrapOne(row.roles);
    if (!player || row.player_id === owner.id) continue;
    members.push(mapPlayerToMember(player, role?.name ?? null, false));
  }

  return members;
}

export const MEMBERSHIP_SELECT = `
  player_id,
  roles ( name ),
  players ( id, username, display_name, email )
` as const;

export const PLAYER_SELECT =
  "id, username, display_name, email" as const;
