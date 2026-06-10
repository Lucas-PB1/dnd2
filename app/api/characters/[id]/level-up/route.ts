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

type CharacterClassLevelRow = {
  class_id: number;
  class_level: number;
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

    const { data: classRows, error: classRowsError } = await supabase
      .from("character_classes")
      .select("class_id, class_level")
      .eq("character_id", characterId);

    if (classRowsError) {
      throw new ApiError(classRowsError.message, 400);
    }

    const classes = (classRows ?? []) as CharacterClassLevelRow[];
    const currentClass = classes.find((entry) => entry.class_id === body.class_id);

    if (!currentClass && body.new_class_level !== 1) {
      return jsonError("Multiclasse deve começar no nível 1.", 400);
    }

    if (currentClass && body.new_class_level <= currentClass.class_level) {
      return jsonError("O novo nível deve ser maior que o nível atual da classe.", 400);
    }

    const currentTotal = classes.reduce(
      (sum, entry) => sum + entry.class_level,
      0,
    );
    const nextTotal =
      currentTotal - (currentClass?.class_level ?? 0) + body.new_class_level;

    if (nextTotal > 20) {
      return jsonError("Nível total não pode exceder 20.", 400);
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
