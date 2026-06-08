import { createAuthedClient } from "@/lib/api/require-user";
import { ApiError, jsonError, jsonOk } from "@/lib/api/errors";
import {
  fetchCharacterBuilderDetails,
  fetchCharacterBuilderSummary,
} from "@/features/character-builder/server";
import { normalizeBuilderClassLevel } from "@/features/character-builder/server/types";

export async function GET(request: Request) {
  try {
    await createAuthedClient();

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") ?? "summary";
    const classLevel = normalizeBuilderClassLevel(searchParams.get("class_level"));

    if (scope === "details") {
      const class_id = Number(searchParams.get("class_id"));
      const species_id = Number(searchParams.get("species_id"));
      const background_id = Number(searchParams.get("background_id"));
      const subclassRaw = searchParams.get("subclass_id");
      const subclass_id =
        subclassRaw && Number.isInteger(Number(subclassRaw)) && Number(subclassRaw) > 0
          ? Number(subclassRaw)
          : null;

      if (
        !Number.isInteger(class_id) ||
        class_id <= 0 ||
        !Number.isInteger(species_id) ||
        species_id <= 0 ||
        !Number.isInteger(background_id) ||
        background_id <= 0
      ) {
        return jsonError("Parâmetros de detalhe inválidos.", 400);
      }

      const data = await fetchCharacterBuilderDetails({
        class_id,
        species_id,
        background_id,
        class_level: classLevel,
        subclass_id,
      });
      return jsonOk(data);
    }

    const data = await fetchCharacterBuilderSummary(classLevel);
    return jsonOk(data);
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 401;
    const message = err instanceof Error ? err.message : "Não autenticado.";
    return jsonError(message, status);
  }
}
