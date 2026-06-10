import { ApiError } from "@/lib/api/errors";
import type { CharacterAdminClient } from "@/lib/character/server/types";
import type { SkillCatalogRow } from "@/lib/character/map-sheet";

export async function fetchSkillCatalog(
  admin: CharacterAdminClient,
): Promise<SkillCatalogRow[]> {
  const { data, error } = await admin
    .from("skills")
    .select("name, base_attribute")
    .order("name");

  if (error) {
    throw new ApiError(error.message, 400);
  }

  return (data ?? []) as SkillCatalogRow[];
}
