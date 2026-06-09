import type {
  AbilityKey,
  BuilderOriginFeatChoice,
  BuilderSkillOption,
  BuilderSpeciesTrait,
  BuilderTraitOption,
  CharacterBuilderData,
  CharacterBuilderState,
  TraitOptionSelection,
} from "@/features/character-builder/types/builder.types";
import {
  progressionTraitOptionsForSlot,
  syncProgressionFeatSlots,
} from "@/features/character-builder/domain/progression/feats";
import { visibleTraitOptionsForGroup } from "./visibility";

export function isSkillProficiencyOptionGroup(optionGroup: string): boolean {
  const normalized = optionGroup.trim().toLowerCase();
  return (
    optionGroup === "Skill Proficiency" ||
    optionGroup === "Skill or Tool Proficiency" ||
    normalized === "skill" ||
    normalized === "proficiency"
  );
}

/** Feats como Observant/Keen Mind: proficiência ou expertise se já proficiente. */
export function grantsExpertiseIfAlreadyProficient(
  traitDescription: string | null | undefined,
): boolean {
  if (!traitDescription) return false;
  return /gain expertise in it/i.test(traitDescription);
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

  for (const skillId of progressionFeatSkillIds(data, state)) {
    ids.add(skillId);
  }

  return [...ids];
}

/** Perícias concedidas por feats de progressão (Observant, Keen Mind, etc.). */
export function progressionFeatSkillIds(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
): number[] {
  const ids: number[] = [];

  for (const slot of syncProgressionFeatSlots(state)) {
    if (slot.kind !== "feat" || !slot.feat_id) continue;

    const feat = data.progression_feats.find((entry) => entry.id === slot.feat_id);
    if (!feat) continue;

    const selections = progressionTraitOptionsForSlot(state, slot.at_level);
    const options = allTraitOptionsFromOriginFeatChoices(feat.origin_feat_choices);
    ids.push(...skillIdsFromTraitSelections(selections, options, data.skills));
  }

  return ids;
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
  group: {
    trait_id: number;
    option_group: string;
    trait_description?: string | null;
  },
  data: CharacterBuilderData,
  state: CharacterBuilderState,
  allSelections: TraitOptionSelection[],
): BuilderTraitOption[] {
  const filtered = visibleTraitOptionsForGroup(options, group, allSelections);

  if (!isSkillProficiencyOptionGroup(group.option_group)) {
    return filtered;
  }

  if (grantsExpertiseIfAlreadyProficient(group.trait_description)) {
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
  allSelections: TraitOptionSelection[],
): BuilderTraitOption[] {
  const filtered = visibleTraitOptionsForGroup(options, group, allSelections);

  if (!isAbilityScoreOptionGroup(group.option_group)) {
    return filtered;
  }

  return filtered;
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
    allSelections,
  );
}
