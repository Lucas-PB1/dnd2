import { createAuthedClient } from "@/lib/api/require-user";
import { ApiError, jsonError, jsonOk } from "@/lib/api/errors";
import { assertCampaignMember } from "@/lib/campaign/access";
import { removeCampaignMemberFromDb } from "@/lib/campaign/member-actions";

type RouteContext = {
  params: Promise<{ id: string; playerId: string }>;
};

function parseCampaignId(raw: string): number | null {
  const campaignId = Number(raw);
  if (!Number.isInteger(campaignId) || campaignId <= 0) {
    return null;
  }
  return campaignId;
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { userId } = await createAuthedClient();
    const { id, playerId } = await context.params;
    const campaignId = parseCampaignId(id);

    if (!campaignId || !playerId) {
      return jsonError("Requisição inválida.", 400);
    }

    const { campaign, isOwner } = await assertCampaignMember(campaignId, userId);

    await removeCampaignMemberFromDb(
      campaignId,
      campaign.owner_player_id,
      playerId,
      userId,
      isOwner,
    );

    return jsonOk({ ok: true });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 401;
    const message = err instanceof Error ? err.message : "Não autenticado.";
    return jsonError(message, status);
  }
}
