import type { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "@/lib/api/errors";
import {
  buildCreateCharacterRpcPayload,
  mapRpcError,
} from "@/lib/character/map-row";
import type { CreateCharacterPayload } from "@/shared/character";

type CreateCharacterRpcResult = {
  character_id: number;
  level: number;
};

export async function createCharacterWithRpcPayload(
  supabase: SupabaseClient,
  rpcPayload: Record<string, unknown>,
): Promise<CreateCharacterRpcResult> {
  const { data, error } = await supabase.rpc("create_character", {
    p_payload: rpcPayload,
  });

  if (error) {
    throw new ApiError(mapRpcError(error.message), 400);
  }

  const result = data as CreateCharacterRpcResult | null;

  if (!result?.character_id) {
    throw new ApiError("Não foi possível criar o personagem.", 500);
  }

  return {
    character_id: result.character_id,
    level: result.level,
  };
}

export async function createCharacterViaRpc(
  supabase: SupabaseClient,
  payload: CreateCharacterPayload,
): Promise<CreateCharacterRpcResult> {
  return createCharacterWithRpcPayload(
    supabase,
    buildCreateCharacterRpcPayload(payload),
  );
}
