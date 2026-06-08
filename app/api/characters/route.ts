import { createAuthedClient } from "@/lib/api/require-user";
import { ApiError, jsonError, jsonOk } from "@/lib/api/errors";
import {
  createCharacterFromBuilderState,
  createCharacterViaRpc,
} from "@/lib/character/create";
import { listCharactersForUser } from "@/lib/character/server";
import {
  CHARACTER_NAME_MAX,
  CHARACTER_NAME_MIN,
  type CreateCharacterPayload,
} from "@/features/character-sheet/types/character.types";
import type { CharacterBuilderState } from "@/features/character-builder/types/builder.types";

function isBuilderState(value: unknown): value is CharacterBuilderState {
  return (
    typeof value === "object" &&
    value !== null &&
    "step" in value &&
    "class_id" in value
  );
}

export async function GET() {
  try {
    const { userId } = await createAuthedClient();
    const characters = await listCharactersForUser(userId);
    return jsonOk({ characters });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 401;
    const message = err instanceof Error ? err.message : "Não autenticado.";
    return jsonError(message, status);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase } = await createAuthedClient();

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonError("Corpo da requisição inválido.", 400);
    }

    if (isBuilderState(body)) {
      const result = await createCharacterFromBuilderState(supabase, body);
      return jsonOk(result, 201);
    }

    const legacy = body as CreateCharacterPayload;
    const name = legacy.name?.trim() ?? "";

    if (name.length < CHARACTER_NAME_MIN) {
      return jsonError(
        `O nome deve ter pelo menos ${CHARACTER_NAME_MIN} caracteres.`,
        400,
      );
    }
    if (name.length > CHARACTER_NAME_MAX) {
      return jsonError(
        `O nome pode ter no máximo ${CHARACTER_NAME_MAX} caracteres.`,
        400,
      );
    }

    if (
      !Number.isInteger(legacy.species_id) ||
      legacy.species_id <= 0 ||
      !Number.isInteger(legacy.background_id) ||
      legacy.background_id <= 0 ||
      !Number.isInteger(legacy.class_id) ||
      legacy.class_id <= 0
    ) {
      return jsonError("Selecione espécie, antecedente e classe.", 400);
    }

    const result = await createCharacterViaRpc(supabase, {
      name,
      species_id: legacy.species_id,
      background_id: legacy.background_id,
      class_id: legacy.class_id,
    });

    return jsonOk(result, 201);
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 401;
    const message = err instanceof Error ? err.message : "Não autenticado.";
    return jsonError(message, status);
  }
}
