import type {
  AbilityKey,
  BuilderOriginFeatChoice,
  BuilderSkillOption,
  BuilderSpeciesTrait,
  BuilderSpellOption,
  BuilderTraitOption,
  CharacterBuilderData,
  CharacterBuilderState,
  FeatSpellSource,
  TraitOptionSelection,
} from "@/features/character/types/builder.types";

/** Mantém itens selecionados visíveis; oculta o restante já usado em outra lista. */
export function visibleWhenTaken<T>(
  items: T[],
  selectedIds: Iterable<number>,
  takenIds: Iterable<number>,
  getId: (item: T) => number,
): T[] {
  const selected = new Set(selectedIds);
  const taken = new Set(takenIds);
  return items.filter((item) => {
    const id = getId(item);
    return selected.has(id) || !taken.has(id);
  });
}

export type SpellSelectionScope = {
  cantrips?: boolean;
  spellbook?: boolean;
  prepared?: boolean;
  featSources?: FeatSpellSource[];
};

export function spellIdsTakenElsewhere(
  state: CharacterBuilderState,
  scope: SpellSelectionScope = {},
): number[] {
  const ids: number[] = [];

  if (!scope.cantrips) {
    ids.push(...state.cantrip_spell_ids);
  }
  if (!scope.spellbook) {
    ids.push(...state.spellbook_spell_ids);
  }
  if (!scope.prepared) {
    ids.push(...state.prepared_spell_ids);
  }

  const excludedFeatSources = new Set(scope.featSources ?? []);
  for (const entry of state.feat_spell_selections) {
    if (!excludedFeatSources.has(entry.source)) {
      ids.push(entry.spell_id);
    }
  }

  return ids;
}

export function visibleSpells(
  spells: BuilderSpellOption[],
  selectedIds: number[],
  takenIds: number[],
): BuilderSpellOption[] {
  return visibleWhenTaken(
    spells,
    selectedIds,
    takenIds,
    (spell) => spell.spell_id,
  );
}

export function visibleTraitOptionsForGroup(
  options: BuilderTraitOption[],
  group: { trait_id: number; option_group: string },
  allSelections: TraitOptionSelection[],
): BuilderTraitOption[] {
  const inGroup = (entry: TraitOptionSelection) =>
    entry.trait_id === group.trait_id &&
    entry.option_group === group.option_group;

  const selectedInGroup = allSelections
    .filter(inGroup)
    .map((entry) => entry.trait_option_id);
  const takenElsewhere = allSelections
    .filter((entry) => !inGroup(entry))
    .map((entry) => entry.trait_option_id);

  return visibleWhenTaken(
    options,
    selectedInGroup,
    [...takenElsewhere, ...selectedInGroup],
    (option) => option.trait_option_id,
  );
}

export function isSkillProficiencyOptionGroup(optionGroup: string): boolean {
  return (
    optionGroup === "Skill Proficiency" ||
    optionGroup === "Skill or Tool Proficiency"
  );
}

function resolveTraitOptionSkillId(
  option: BuilderTraitOption,
  skills: BuilderSkillOption[],
): number | null {
  if (option.skill_id != null) return option.skill_id;
  return skills.find((skill) => skill.name === option.name)?.skill_id ?? null;
}

function skillIdsFromTraitSelections(
  selections: TraitOptionSelection[],
  options: BuilderTraitOption[],
  skills: BuilderSkillOption[],
): number[] {
  const byOptionId = new Map(options.map((opt) => [opt.trait_option_id, opt]));
  const ids: number[] = [];

  for (const selection of selections) {
    const option = byOptionId.get(selection.trait_option_id);
    if (!option) continue;
    const skillId = resolveTraitOptionSkillId(option, skills);
    if (skillId !== null) ids.push(skillId);
  }

  return ids;
}

function allTraitOptionsFromSpecies(
  speciesTraits: BuilderSpeciesTrait[],
): BuilderTraitOption[] {
  return speciesTraits.flatMap((trait) =>
    trait.choice_groups.flatMap((group) => group.options),
  );
}

function allTraitOptionsFromOriginFeatChoices(
  choices: BuilderOriginFeatChoice[],
): BuilderTraitOption[] {
  return choices.flatMap((group) => group.options);
}

/** Perícias já concedidas por antecedente, classe ou outras escolhas de traço/feats. */
export function proficientSkillIds(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
): number[] {
  const background = data.backgrounds.find(
    (entry) => entry.id === state.background_id,
  );
  const species = data.species.find((entry) => entry.id === state.species_id);
  const humanFeat = data.origin_feats.find(
    (entry) => entry.id === state.human_origin_feat_id,
  );

  const ids = new Set<number>();

  for (const skill of background?.skill_proficiencies ?? []) {
    ids.add(skill.skill_id);
  }
  for (const skillId of state.class_skill_ids) {
    ids.add(skillId);
  }

  const speciesOptions = allTraitOptionsFromSpecies(species?.traits ?? []);
  for (const skillId of skillIdsFromTraitSelections(
    state.species_trait_options,
    speciesOptions,
    data.skills,
  )) {
    ids.add(skillId);
  }

  const backgroundFeatOptions = allTraitOptionsFromOriginFeatChoices(
    background?.origin_feat_choices ?? [],
  );
  for (const skillId of skillIdsFromTraitSelections(
    state.origin_feat_trait_options,
    backgroundFeatOptions,
    data.skills,
  )) {
    ids.add(skillId);
  }

  const humanFeatOptions = allTraitOptionsFromOriginFeatChoices(
    humanFeat?.origin_feat_choices ?? [],
  );
  for (const skillId of skillIdsFromTraitSelections(
    state.human_origin_feat_trait_options,
    humanFeatOptions,
    data.skills,
  )) {
    ids.add(skillId);
  }

  return [...ids];
}

export function skillIdsGrantedOutsideClass(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
): number[] {
  const all = proficientSkillIds(data, state);
  return all.filter((skillId) => !state.class_skill_ids.includes(skillId));
}

export function visibleTraitOptionsForSkillGroup(
  options: BuilderTraitOption[],
  group: { trait_id: number; option_group: string },
  data: CharacterBuilderData,
  state: CharacterBuilderState,
  allSelections: TraitOptionSelection[],
): BuilderTraitOption[] {
  const filtered = visibleTraitOptionsForGroup(options, group, allSelections);

  if (!isSkillProficiencyOptionGroup(group.option_group)) {
    return filtered;
  }

  const selectedInGroup = allSelections
    .filter(
      (entry) =>
        entry.trait_id === group.trait_id &&
        entry.option_group === group.option_group,
    )
    .map((entry) => entry.trait_option_id);
  const proficient = new Set(proficientSkillIds(data, state));

  return filtered.filter((option) => {
    if (selectedInGroup.includes(option.trait_option_id)) return true;
    const skillId = resolveTraitOptionSkillId(option, data.skills);
    if (skillId === null) return true;
    return !proficient.has(skillId);
  });
}

const ABILITY_NAME_TO_KEY: Record<string, AbilityKey> = {
  STR: "STR",
  DEX: "DEX",
  CON: "CON",
  INT: "INT",
  WIS: "WIS",
  CHA: "CHA",
  Strength: "STR",
  Dexterity: "DEX",
  Constitution: "CON",
  Intelligence: "INT",
  Wisdom: "WIS",
  Charisma: "CHA",
  Força: "STR",
  Destreza: "DEX",
  Constituição: "CON",
  Inteligência: "INT",
  Sabedoria: "WIS",
  Carisma: "CHA",
};

export function usedBackgroundAbilityKeys(
  state: CharacterBuilderState,
): AbilityKey[] {
  const keys: AbilityKey[] = [];
  if (state.background_asi.plus2) keys.push(state.background_asi.plus2);
  if (state.background_asi.plus1) keys.push(state.background_asi.plus1);
  return keys;
}

export function isAbilityScoreOptionGroup(optionGroup: string): boolean {
  return (
    optionGroup === "Ability Score" ||
    optionGroup === "Spellcasting Ability" ||
    optionGroup === "Primary Ability Score" ||
    optionGroup === "Secondary Ability Score" ||
    optionGroup === "Tertiary Ability Score"
  );
}

export function visibleTraitOptionsForAbilityGroup(
  options: BuilderTraitOption[],
  group: { trait_id: number; option_group: string },
  state: CharacterBuilderState,
  allSelections: TraitOptionSelection[],
): BuilderTraitOption[] {
  const filtered = visibleTraitOptionsForGroup(options, group, allSelections);

  if (!isAbilityScoreOptionGroup(group.option_group)) {
    return filtered;
  }

  const usedAbilities = new Set(usedBackgroundAbilityKeys(state));
  const selectedInGroup = allSelections
    .filter(
      (entry) =>
        entry.trait_id === group.trait_id &&
        entry.option_group === group.option_group,
    )
    .map((entry) => entry.trait_option_id);

  return filtered.filter((option) => {
    if (selectedInGroup.includes(option.trait_option_id)) return true;
    const abilityKey = ABILITY_NAME_TO_KEY[option.name];
    if (!abilityKey) return true;
    return !usedAbilities.has(abilityKey);
  });
}

export function visibleTraitOptions(
  options: BuilderTraitOption[],
  group: { trait_id: number; option_group: string },
  data: CharacterBuilderData,
  state: CharacterBuilderState,
  allSelections: TraitOptionSelection[],
): BuilderTraitOption[] {
  const withSkills = visibleTraitOptionsForSkillGroup(
    options,
    group,
    data,
    state,
    allSelections,
  );
  return visibleTraitOptionsForAbilityGroup(
    withSkills,
    group,
    state,
    allSelections,
  );
}

export function visibleHumanOriginFeats(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
) {
  const background = data.backgrounds.find(
    (entry) => entry.id === state.background_id,
  );
  if (!background?.origin_feat_id) return data.origin_feats;

  return data.origin_feats.filter(
    (feat) => feat.id !== background.origin_feat_id,
  );
}
