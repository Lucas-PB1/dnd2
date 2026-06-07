import { createAuthedClient } from "@/lib/api/require-user";
import { ApiError, jsonError, jsonOk } from "@/lib/api/errors";
import { CAMPAIGN_SELECT, mapCampaignRow } from "@/lib/campaign/map-row";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { supabase, userId } = await createAuthedClient();

    const { id } = await context.params;
    const campaignId = Number(id);

    if (!Number.isInteger(campaignId) || campaignId <= 0) {
      return jsonError("Campanha inválida.", 400);
    }

    const { data, error } = await supabase
      .from("campaigns")
      .select(CAMPAIGN_SELECT)
      .eq("id", campaignId)
      .maybeSingle();

    if (error) {
      return jsonError(error.message, 400);
    }

    if (!data) {
      return jsonError("Campanha não encontrada.", 404);
    }

    const campaign = mapCampaignRow(data);

    return jsonOk({
      campaign: {
        ...campaign,
        is_owner: campaign.owner_player_id === userId,
      },
    });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 401;
    const message = err instanceof Error ? err.message : "Não autenticado.";
    return jsonError(message, status);
  }
}
