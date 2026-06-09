import { createAdminClient } from "@/lib/supabase/admin";
import { createAuthedClient } from "@/lib/api/require-user";
import { ApiError, jsonError, jsonOk } from "@/lib/api/errors";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type SnippetType = "trait" | "feat" | "spell";

function parseSnippetType(value: string | null): SnippetType | null {
  if (value === "trait" || value === "feat" || value === "spell") return value;
  return null;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { userId } = await createAuthedClient();
    const { id } = await context.params;
    const characterId = Number(id);

    if (!Number.isInteger(characterId) || characterId <= 0) {
      return jsonError("Personagem inválido.", 400);
    }

    const url = new URL(request.url);
    const type = parseSnippetType(url.searchParams.get("type"));
    const catalogId = Number(url.searchParams.get("id"));

    if (!type || !Number.isInteger(catalogId) || catalogId <= 0) {
      return jsonError("Parâmetros inválidos.", 400);
    }

    const admin = createAdminClient();
    const { data: character, error: characterError } = await admin
      .from("characters")
      .select("id")
      .eq("id", characterId)
      .eq("owner_player_id", userId)
      .maybeSingle();

    if (characterError) {
      throw new ApiError(characterError.message, 400);
    }
    if (!character) {
      return jsonError("Personagem não encontrado.", 404);
    }

    const table = type === "trait" ? "traits" : type === "feat" ? "feats" : "spells";
    const { data, error } = await admin
      .from(table)
      .select("description")
      .eq("id", catalogId)
      .maybeSingle();

    if (error) {
      throw new ApiError(error.message, 400);
    }
    if (!data) {
      return jsonError("Conteúdo não encontrado.", 404);
    }

    return jsonOk({ description: data.description ?? null });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 401;
    const message = err instanceof Error ? err.message : "Não autenticado.";
    return jsonError(message, status);
  }
}
