import { createAuthedClient } from "@/lib/api/require-user";
import { ApiError, jsonError, jsonOk } from "@/lib/api/errors";
import { getCharacterForUser } from "@/lib/character/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { userId } = await createAuthedClient();
    const { id } = await context.params;
    const characterId = Number(id);

    if (!Number.isInteger(characterId) || characterId <= 0) {
      return jsonError("Personagem inválido.", 400);
    }

    const character = await getCharacterForUser(characterId, userId);

    if (!character) {
      return jsonError("Personagem não encontrado.", 404);
    }

    return jsonOk({
      character: {
        ...character,
        is_owner: true,
      },
    });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 401;
    const message = err instanceof Error ? err.message : "Não autenticado.";
    return jsonError(message, status);
  }
}
