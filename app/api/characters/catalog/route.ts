import { createAuthedClient } from "@/lib/api/require-user";
import { ApiError, jsonError, jsonOk } from "@/lib/api/errors";
import { fetchCharacterCatalog } from "@/lib/character/catalog";

export async function GET() {
  try {
    await createAuthedClient();
    const catalog = await fetchCharacterCatalog();
    return jsonOk(catalog);
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 401;
    const message = err instanceof Error ? err.message : "Não autenticado.";
    return jsonError(message, status);
  }
}
