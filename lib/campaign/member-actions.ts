import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/api/errors";
import {
  buildMembersList,
  MEMBERSHIP_SELECT,
  PLAYER_SELECT,
  type MembershipRow,
} from "@/lib/campaign/members";
import type {
  CampaignInviteRole,
  CampaignMember,
} from "@/features/campaign/types/campaign.types";
import { DEFAULT_INVITE_ROLE } from "@/features/campaign/types/campaign.types";

export async function fetchCampaignMembersFromDb(
  campaignId: number,
): Promise<CampaignMember[]> {
  const admin = createAdminClient();

  const { data: campaign, error: campaignError } = await admin
    .from("campaigns")
    .select("owner_player_id")
    .eq("id", campaignId)
    .single();

  if (campaignError || !campaign) {
    throw new ApiError("Campanha não encontrada.", 404);
  }

  const { data: owner, error: ownerError } = await admin
    .from("players")
    .select(PLAYER_SELECT)
    .eq("id", campaign.owner_player_id)
    .single();

  if (ownerError || !owner) {
    throw new ApiError("Dono da campanha não encontrado.", 500);
  }

  const { data: memberships, error: membersError } = await admin
    .from("player_campaigns")
    .select(MEMBERSHIP_SELECT)
    .eq("campaign_id", campaignId);

  if (membersError) {
    throw new ApiError(membersError.message, 400);
  }

  return buildMembersList(owner, (memberships ?? []) as MembershipRow[]);
}

export async function inviteCampaignMemberInDb(
  campaignId: number,
  ownerPlayerId: string,
  email: string,
  role: CampaignInviteRole = DEFAULT_INVITE_ROLE,
): Promise<CampaignMember> {
  const admin = createAdminClient();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail.includes("@")) {
    throw new ApiError("Informe um e-mail válido.", 400);
  }

  const { data: roleRow, error: roleError } = await admin
    .from("roles")
    .select("id, name")
    .eq("name", role)
    .maybeSingle();

  if (roleError || !roleRow) {
    throw new ApiError("Papel inválido.", 400);
  }

  const { data: player, error: playerError } = await admin
    .from("players")
    .select(PLAYER_SELECT)
    .ilike("email", normalizedEmail)
    .maybeSingle();

  if (playerError) {
    throw new ApiError(playerError.message, 400);
  }

  if (!player) {
    throw new ApiError(
      "Jogador não encontrado. Peça para a pessoa entrar no app com Google antes de convidar.",
      404,
    );
  }

  if (player.id === ownerPlayerId) {
    throw new ApiError("O dono da campanha já faz parte da mesa.", 400);
  }

  const { data: existing } = await admin
    .from("player_campaigns")
    .select("player_id")
    .eq("campaign_id", campaignId)
    .eq("player_id", player.id)
    .maybeSingle();

  if (existing) {
    throw new ApiError("Esse jogador já está na campanha.", 409);
  }

  const { error: insertError } = await admin.from("player_campaigns").insert({
    campaign_id: campaignId,
    player_id: player.id,
    role_id: roleRow.id,
  });

  if (insertError) {
    throw new ApiError(insertError.message, 400);
  }

  return {
    player_id: player.id,
    username: player.username,
    display_name: player.display_name,
    email: player.email,
    role_name: roleRow.name,
    is_owner: false,
  };
}

export async function removeCampaignMemberFromDb(
  campaignId: number,
  ownerPlayerId: string,
  targetPlayerId: string,
  actingUserId: string,
  actingIsOwner: boolean,
): Promise<void> {
  if (targetPlayerId === ownerPlayerId) {
    throw new ApiError("O dono da campanha não pode ser removido.", 400);
  }

  const isSelfLeave = actingUserId === targetPlayerId;

  if (!actingIsOwner && !isSelfLeave) {
    throw new ApiError("Somente o dono pode remover outros jogadores.", 403);
  }

  const admin = createAdminClient();
  const { data: membership, error: findError } = await admin
    .from("player_campaigns")
    .select("player_id")
    .eq("campaign_id", campaignId)
    .eq("player_id", targetPlayerId)
    .maybeSingle();

  if (findError) {
    throw new ApiError(findError.message, 400);
  }

  if (!membership) {
    throw new ApiError("Jogador não está nesta campanha.", 404);
  }

  const { error: deleteError } = await admin
    .from("player_campaigns")
    .delete()
    .eq("campaign_id", campaignId)
    .eq("player_id", targetPlayerId);

  if (deleteError) {
    throw new ApiError(deleteError.message, 400);
  }
}
