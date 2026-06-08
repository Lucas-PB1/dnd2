import type {
  BuilderBackgroundEntry,
  BuilderClassEntry,
  BuilderSkillChoiceGroup,
  BuilderSpeciesEntry,
  BuilderToolChoiceGroup,
  CharacterBuilderData,
  CharacterBuilderSummary,
} from "@/features/character-builder/types/builder.types";

function stubClass(
  entry: CharacterBuilderSummary["classes"][number],
): BuilderClassEntry {
  return {
    ...entry,
    skill_choices: entry.skill_choices ?? [],
    tool_choices: [],
    spellcasting: entry.spellcasting ?? null,
    expertise_choices: entry.expertise_choices ?? [],
    features: entry.features ?? [],
    subclasses: entry.subclasses ?? [],
  };
}

function stubSpecies(
  entry: CharacterBuilderSummary["species"][number],
): BuilderSpeciesEntry {
  return {
    ...entry,
    traits: entry.traits ?? [],
  };
}

function stubBackground(
  entry: CharacterBuilderSummary["backgrounds"][number],
): BuilderBackgroundEntry {
  return {
    id: entry.id,
    name: entry.name,
    description: entry.description,
    origin_feat_id: entry.origin_feat_id,
    origin_feat_name: entry.origin_feat_name,
    origin_feat_description: entry.origin_feat_description,
    origin_feat_selection_key: null,
    ability_options: entry.ability_options,
    skill_proficiencies: [],
    tool_proficiency_options: [],
    equipment_options: [],
    origin_feat_choices: [],
    origin_feat_spellcasting: null,
  };
}

export function mergeBuilderData(
  summary: CharacterBuilderSummary,
  details: Partial<CharacterBuilderData> | null,
): CharacterBuilderData {
  const classById = new Map(
    summary.classes.map((entry) => [entry.id, stubClass(entry)]),
  );
  const speciesById = new Map(
    summary.species.map((entry) => [entry.id, stubSpecies(entry)]),
  );
  const backgroundById = new Map(
    summary.backgrounds.map((entry) => [entry.id, stubBackground(entry)]),
  );

  for (const entry of details?.classes ?? []) {
    classById.set(entry.id, entry);
  }
  for (const entry of details?.species ?? []) {
    speciesById.set(entry.id, entry);
  }
  for (const entry of details?.backgrounds ?? []) {
    backgroundById.set(entry.id, entry);
  }

  return {
    classes: [...classById.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR"),
    ),
    species: [...speciesById.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR"),
    ),
    backgrounds: [...backgroundById.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR"),
    ),
    origin_feats: details?.origin_feats ?? [],
    tools_by_category: details?.tools_by_category ?? {},
    skills: details?.skills ?? [],
    details_loaded: details?.details_loaded ?? false,
  };
}
