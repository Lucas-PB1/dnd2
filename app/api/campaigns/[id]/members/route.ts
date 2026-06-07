import { createAuthedClient } from "@/lib/api/require-user";
import { ApiError, jsonError, jsonOk } from "@/lib/api/errors";
import { assertCampaignMember, assertCampaignOwner } from "@/lib/campaign/access";
import {
  fetchCampaignMembersFromDb,
  inviteCampaignMemberInDb,
} from "@/lib/campaign/member-actions";
import {
  DEFAULT_INVITE_ROLE,
  INVITEABLE_ROLES,
  type CampaignInviteRole,
  type InviteMemberPayload,
} from "@/features/campaign/types/campaign.types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseCampaignId(raw: string): number | null {
  const campaignId = Number(raw);
  if (!Number.isInteger(campaignId) || campaignId <= 0) {
    return null;
  }
  return campaignId;
}

function parseInviteRole(role: unknown): CampaignInviteRole {
  if (typeof role !== "string" || !INVITEABLE_ROLES.includes(role as CampaignInviteRole)) {
    return DEFAULT_INVITE_ROLE;
  }
  return role as CampaignInviteRole;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { userId } = await createAuthedClient();
    const { id } = await context.params;
    const campaignId = parseCampaignId(id);

    if (!campaignId) {
      return jsonError("Campanha inválida.", 400);
    }

    await assertCampaignMember(campaignId, userId);
    const members = await fetchCampaignMembersFromDb(campaignId);

    return jsonOk({ members });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 401;
    const message = err instanceof Error ? err.message : "Não autenticado.";
    return jsonError(message, status);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { userId } = await createAuthedClient();
    const { id } = await context.params;
    const campaignId = parseCampaignId(id);

    if (!campaignId) {
      return jsonError("Campanha inválida.", 400);
    }

    const campaign = await assertCampaignOwner(campaignId, userId);

    let body: InviteMemberPayload;

    try {
      body = (await request.json()) as InviteMemberPayload;
    } catch {
      return jsonError("Corpo da requisição inválido.", 400);
    }

    const email = body.email?.trim() ?? "";

    if (!email) {
      return jsonError("Informe o e-mail do jogador.", 400);
    }

    const role = parseInviteRole(body.role);
    const member = await inviteCampaignMemberInDb(
      campaignId,
      campaign.owner_player_id,
      email,
      role,
    );

    return jsonOk({ member }, 201);
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 401;
    const message = err instanceof Error ? err.message : "Não autenticado.";
    return jsonError(message, status);
  }
}
