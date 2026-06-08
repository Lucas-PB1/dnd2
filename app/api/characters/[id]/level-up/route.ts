import { createAuthedClient } from "@/lib/api/require-user";
import { ApiError, jsonError, jsonOk } from "@/lib/api/errors";
import { mapRpcError } from "@/lib/character/map-row";

type LevelUpBody = {
  class_id: number;
  new_class_level: number;
  subclass_id?: number | null;
  choices?: {
    trait_options?: unknown[];
    trait_spell_choices?: unknown[];
  };
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { supabase } = await createAuthedClient();
    const { id } = await context.params;
    const characterId = Number(id);

    if (!Number.isInteger(characterId) || characterId <= 0) {
      return jsonError("Personagem inválido.", 400);
    }

    const body = (await request.json()) as LevelUpBody;

    if (!Number.isInteger(body.class_id) || body.class_id <= 0) {
      return jsonError("Classe inválida.", 400);
    }

    if (
      !Number.isInteger(body.new_class_level) ||
      body.new_class_level < 1 ||
      body.new_class_level > 20
    ) {
      return jsonError("Nível de classe inválido.", 400);
    }

    const { data, error } = await supabase.rpc("level_up_character", {
      p_character_id: characterId,
      p_class_id: body.class_id,
      p_new_class_level: body.new_class_level,
      p_subclass_id: body.subclass_id ?? null,
      p_choices: body.choices ?? {},
    });

    if (error) {
      throw new ApiError(mapRpcError(error.message), 400);
    }

    return jsonOk(data);
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 401;
    const message = err instanceof Error ? err.message : "Não autenticado.";
    return jsonError(message, status);
  }
}
