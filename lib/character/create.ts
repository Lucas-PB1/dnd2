import type { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "@/lib/api/errors";
import {
  buildCreateCharacterRpcPayload,
  mapRpcError,
} from "@/lib/character/map-row";
import { toCreateCharacterRpcBody, buildRpcPayloadFromBuilderState } from "@/features/character-builder/domain/payload";
import { fetchCharacterBuilderDataForState } from "@/features/character-builder/server";
import type { CreateCharacterPayload } from "@/features/character-sheet/types/character.types";
import type { CharacterBuilderState } from "@/features/character-builder/types/builder.types";
import {
  MAX_CLASS_LEVEL,
  MIN_CLASS_LEVEL,
} from "@/features/character-builder/domain/progression/levels";
import { totalCharacterLevel } from "@/features/character-builder/domain/multiclass/multiclass";

type CreateCharacterRpcResult = {
  character_id: number;
  level: number;
};

async function invokeCreateCharacter(
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
  return invokeCreateCharacter(
    supabase,
    buildCreateCharacterRpcPayload(payload),
  );
}

export async function createCharacterFromBuilderState(
  supabase: SupabaseClient,
  state: CharacterBuilderState,
): Promise<CreateCharacterRpcResult> {
  if (!state.class_id || !state.species_id || !state.background_id) {
    throw new ApiError("Seleções incompletas.", 400);
  }

  if (
    !Number.isInteger(state.class_level) ||
    state.class_level < MIN_CLASS_LEVEL ||
    state.class_level > MAX_CLASS_LEVEL
  ) {
    throw new ApiError("Escolha um nível entre 1 e 20.", 400);
  }

  if (totalCharacterLevel(state) > MAX_CLASS_LEVEL) {
    throw new ApiError(`Nível total não pode exceder ${MAX_CLASS_LEVEL}.`, 400);
  }

  const data = await fetchCharacterBuilderDataForState({
    class_id: state.class_id,
    species_id: state.species_id,
    background_id: state.background_id,
    class_level: state.class_level,
    subclass_id: state.subclass_id,
  });
  const payload = buildRpcPayloadFromBuilderState(data, state);
  const rpcBody = toCreateCharacterRpcBody(payload);
  return invokeCreateCharacter(supabase, rpcBody);
}
