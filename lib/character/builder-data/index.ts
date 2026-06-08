import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/api/errors";
import { mergeBuilderData } from "@/lib/character/builder-merge";
import type {
  BuilderSpeciesEntry,
  BuilderSpeciesSummaryEntry,
  CharacterBuilderData,
  CharacterBuilderSummary,
} from "@/features/character/types/builder.types";
import { fetchBackgroundById, fetchBackgroundsSummary } from "./fetch-backgrounds";
import { fetchClassById, fetchClassesSummary } from "./fetch-classes";
import { fetchOriginFeatsEnriched } from "./fetch-origin-feats";
import { fetchSpeciesTraitsForSpecies } from "./fetch-species";
import { fetchToolsByCategory } from "./fetch-tools";
import type { BuilderDetailsRequest } from "./types";

export type { BuilderDetailsRequest } from "./types";

export async function fetchCharacterBuilderSummary(): Promise<CharacterBuilderSummary> {
  const admin = createAdminClient();

  const [classes, speciesResult, backgrounds] = await Promise.all([
    fetchClassesSummary(admin),
    admin
      .from("species")
      .select("id, name, description, creature_type, size_options, base_speed")
      .order("name"),
    fetchBackgroundsSummary(admin),
  ]);

  if (speciesResult.error) {
    throw new ApiError(speciesResult.error.message, 400);
  }

  const species: BuilderSpeciesSummaryEntry[] = (speciesResult.data ?? []).map(
    (entry) => ({ ...entry }),
  );

  return {
    classes: classes.map(
      ({
        id,
        name,
        hit_die,
        saving_throws,
        weapons,
        armor,
        spellcasting,
        expertise_choices,
      }) => ({
        id,
        name,
        hit_die,
        saving_throws,
        weapons,
        armor,
        spellcasting: spellcasting ?? null,
        expertise_choices: expertise_choices ?? [],
      }),
    ),
    species,
    backgrounds,
  };
}

export async function fetchCharacterBuilderDetails(
  request: BuilderDetailsRequest,
): Promise<Pick<
  CharacterBuilderData,
  "classes" | "species" | "backgrounds" | "origin_feats" | "tools_by_category" | "skills" | "details_loaded"
>> {
  const admin = createAdminClient();

  const [
    cls,
    speciesResult,
    background,
    originFeatsResult,
    tools_by_category,
    skillsResult,
    speciesTraits,
  ] = await Promise.all([
    fetchClassById(admin, request.class_id),
    admin
      .from("species")
      .select("id, name, description, creature_type, size_options, base_speed")
      .eq("id", request.species_id)
      .maybeSingle(),
    fetchBackgroundById(admin, request.background_id),
    fetchOriginFeatsEnriched(admin),
    fetchToolsByCategory(admin),
    admin.from("skills").select("id, name, base_attribute").order("name"),
    fetchSpeciesTraitsForSpecies(admin, request.species_id),
  ]);

  if (speciesResult.error) throw new ApiError(speciesResult.error.message, 400);
  if (skillsResult.error) throw new ApiError(skillsResult.error.message, 400);

  const speciesRow = speciesResult.data;

  if (!cls || !background || !speciesRow) {
    throw new ApiError("Seleções inválidas para carregar detalhes.", 400);
  }

  const species: BuilderSpeciesEntry = {
    ...speciesRow,
    traits: speciesTraits,
  };

  return {
    classes: [cls],
    species: [species],
    backgrounds: [background],
    origin_feats: originFeatsResult,
    tools_by_category,
    skills: (skillsResult.data ?? []).map((skill) => ({
      skill_id: skill.id,
      name: skill.name,
      base_attribute: skill.base_attribute,
    })),
    details_loaded: true,
  };
}

export async function fetchCharacterBuilderDataForState(
  request: BuilderDetailsRequest,
): Promise<CharacterBuilderData> {
  const [summary, details] = await Promise.all([
    fetchCharacterBuilderSummary(),
    fetchCharacterBuilderDetails(request),
  ]);
  return mergeBuilderData(summary, details);
}

export async function fetchCharacterBuilderData(): Promise<CharacterBuilderData> {
  const summary = await fetchCharacterBuilderSummary();
  return mergeBuilderData(summary, null);
}
