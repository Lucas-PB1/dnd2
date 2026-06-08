import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/api/errors";
import { mergeBuilderData } from "@/features/character-builder/domain/merge";
import type {
  BuilderSpeciesEntry,
  BuilderSpeciesSummaryEntry,
  CharacterBuilderData,
  CharacterBuilderSummary,
} from "@/features/character-builder/types/builder.types";
import { fetchBackgroundById, fetchBackgroundsSummary } from "./fetch-backgrounds";
import { fetchClassById, fetchClassesSummary } from "./fetch-classes";
import { fetchOriginFeatsEnriched } from "./fetch-origin-feats";
import { fetchProgressionFeatsEnriched } from "./fetch-progression-feats";
import { fetchSpeciesTraitsForSpecies, fetchAllSpeciesTraits } from "./fetch-species";
import { fetchToolsByCategory } from "./fetch-tools";
import type { BuilderDetailsRequest } from "./types";
import { normalizeBuilderClassLevel } from "./types";

export type { BuilderDetailsRequest } from "./types";

export async function fetchCharacterBuilderSummary(
  classLevel = 1,
): Promise<CharacterBuilderSummary> {
  const admin = createAdminClient();
  const level = normalizeBuilderClassLevel(classLevel);

  const [classes, speciesResult, backgrounds, speciesTraitsById] =
    await Promise.all([
    fetchClassesSummary(admin, level),
    admin
      .from("species")
      .select("id, name, description, creature_type, size_options, base_speed")
      .order("name"),
    fetchBackgroundsSummary(admin),
    fetchAllSpeciesTraits(admin),
  ]);

  if (speciesResult.error) {
    throw new ApiError(speciesResult.error.message, 400);
  }

  const species: BuilderSpeciesSummaryEntry[] = (speciesResult.data ?? []).map(
    (entry) => ({
      ...entry,
      traits: speciesTraitsById.get(entry.id) ?? [],
    }),
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
        skill_choices,
        spellcasting,
        expertise_choices,
        features,
        subclasses,
      }) => ({
        id,
        name,
        hit_die,
        saving_throws,
        weapons,
        armor,
        skill_choices: skill_choices ?? [],
        spellcasting: spellcasting ?? null,
        expertise_choices: expertise_choices ?? [],
        optional_feature_groups: [],
        features: features ?? [],
        subclasses: subclasses ?? [],
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
  "classes" | "species" | "backgrounds" | "origin_feats" | "progression_feats" | "tools_by_category" | "skills" | "details_loaded"
>> {
  const admin = createAdminClient();

  const [
    cls,
    speciesResult,
    background,
    originFeatsResult,
    progressionFeatsResult,
    tools_by_category,
    skillsResult,
    speciesTraits,
  ] = await Promise.all([
    fetchClassById(admin, request.class_id, request.class_level, request.subclass_id ?? null),
    admin
      .from("species")
      .select("id, name, description, creature_type, size_options, base_speed")
      .eq("id", request.species_id)
      .maybeSingle(),
    fetchBackgroundById(admin, request.background_id),
    fetchOriginFeatsEnriched(admin),
    fetchProgressionFeatsEnriched(admin),
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
    progression_feats: progressionFeatsResult,
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
    fetchCharacterBuilderSummary(request.class_level),
    fetchCharacterBuilderDetails(request),
  ]);
  return mergeBuilderData(summary, details);
}

export async function fetchCharacterBuilderData(): Promise<CharacterBuilderData> {
  const summary = await fetchCharacterBuilderSummary();
  return mergeBuilderData(summary, null);
}
