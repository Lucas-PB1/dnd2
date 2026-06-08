import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/api/errors";
import type { CharacterCatalog } from "@/features/character-sheet/types/character.types";

export async function fetchCharacterCatalog(): Promise<CharacterCatalog> {
  const admin = createAdminClient();

  const [speciesResult, backgroundsResult, classesResult] = await Promise.all([
    admin
      .from("species")
      .select("id, name, description, creature_type, size_options, base_speed")
      .order("name"),
    admin.from("backgrounds").select("id, name, description").order("name"),
    admin.from("classes").select("id, name").order("name"),
  ]);

  if (speciesResult.error) {
    throw new ApiError(speciesResult.error.message, 400);
  }
  if (backgroundsResult.error) {
    throw new ApiError(backgroundsResult.error.message, 400);
  }
  if (classesResult.error) {
    throw new ApiError(classesResult.error.message, 400);
  }

  return {
    species: speciesResult.data ?? [],
    backgrounds: backgroundsResult.data ?? [],
    classes: classesResult.data ?? [],
  };
}
