import type { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "@/lib/api/errors";
import { createCharacterWithRpcPayload } from "@/lib/character/create";
import {
  buildRpcPayloadFromBuilderState,
  toCreateCharacterRpcBody,
} from "@/features/character-builder/domain/payload";
import { totalCharacterLevel } from "@/features/character-builder/domain/multiclass/multiclass";
import {
  MAX_CLASS_LEVEL,
  MIN_CLASS_LEVEL,
} from "@/features/character-builder/domain/progression/levels";
import { fetchCharacterBuilderDataForState } from "@/features/character-builder/server";
import type { CharacterBuilderState } from "@/features/character-builder/types/builder.types";

type CreateCharacterRpcResult = {
  character_id: number;
  level: number;
};

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
  return createCharacterWithRpcPayload(
    supabase,
    toCreateCharacterRpcBody(payload),
  );
}
