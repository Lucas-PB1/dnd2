import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError, jsonError, jsonOk } from "@/lib/api/errors";
import { clampClassLevel } from "@/features/character-builder/domain/progression/levels";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = clampClassLevel(Number(searchParams.get("level") ?? "1"));

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("items")
      .select("id, name, cost_gp, is_magical")
      .not("cost_gp", "is", null)
      .order("cost_gp")
      .limit(200);

    if (error) {
      throw new ApiError(error.message, 400);
    }

    const items = (data ?? [])
      .filter((row) => row.cost_gp != null)
      .map((row) => ({
        id: row.id,
        name: row.name,
        cost_gp: Number(row.cost_gp),
        is_magical: row.is_magical,
      }));

    return jsonOk({ level, items });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Erro ao carregar loja.";
    return jsonError(message, status);
  }
}
