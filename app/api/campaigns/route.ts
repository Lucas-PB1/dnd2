import { createAuthedClient } from "@/lib/api/require-user";
import { ApiError, jsonError, jsonOk } from "@/lib/api/errors";
import { CAMPAIGN_BASE_SELECT, CAMPAIGN_SELECT, mapCampaignRow } from "@/lib/campaign/map-row";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CAMPAIGN_NAME_MAX,
  CAMPAIGN_NAME_MIN,
  type CreateCampaignPayload,
} from "@/features/campaign/types/campaign.types";

export async function GET() {
  try {
    const { supabase } = await createAuthedClient();
    const { data, error } = await supabase
      .from("campaigns")
      .select(CAMPAIGN_SELECT)
      .order("updated_at", { ascending: false });

    if (error) {
      return jsonError(error.message, 400);
    }

    return jsonOk({
      campaigns: (data ?? []).map(mapCampaignRow),
    });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 401;
    const message = err instanceof Error ? err.message : "Não autenticado.";
    return jsonError(message, status);
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await createAuthedClient();

    let body: CreateCampaignPayload;

    try {
      body = (await request.json()) as CreateCampaignPayload;
    } catch {
      return jsonError("Corpo da requisição inválido.", 400);
    }

    const name = body.name?.trim() ?? "";
    const description = body.description?.trim() || null;

    if (name.length < CAMPAIGN_NAME_MIN) {
      return jsonError(
        `O nome deve ter pelo menos ${CAMPAIGN_NAME_MIN} caracteres.`,
        400,
      );
    }
    if (name.length > CAMPAIGN_NAME_MAX) {
      return jsonError(
        `O nome pode ter no máximo ${CAMPAIGN_NAME_MAX} caracteres.`,
        400,
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("campaigns")
      .insert({
        owner_player_id: userId,
        name,
        description,
      })
      .select(CAMPAIGN_BASE_SELECT)
      .single();

    if (error) {
      return jsonError(error.message, 400);
    }

    return jsonOk(
      { campaign: { ...mapCampaignRow(data), member_count: 0 } },
      201,
    );
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 401;
    const message = err instanceof Error ? err.message : "Não autenticado.";
    return jsonError(message, status);
  }
}
