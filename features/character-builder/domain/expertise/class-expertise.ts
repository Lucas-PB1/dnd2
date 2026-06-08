import type {
  BuilderClassEntry,
  BuilderExpertiseGroup,
  BuilderSkillOption,
  BuilderTraitOption,
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";
import {
  progressionTraitOptionsForSlot,
  syncProgressionFeatSlots,
} from "@/features/character-builder/domain/progression/feats";
import {
  grantsExpertiseIfAlreadyProficient,
  isSkillProficiencyOptionGroup,
  proficientSkillIds,
} from "@/features/character-builder/domain/selection/trait-options";

const EXPERTISE_TRAIT_PATTERN = /expertise/i;
const NON_SKILL_EXPERTISE_PATTERN = /infiltration expertise/i;

export function isExpertiseTrait(name: string, description: string | null): boolean {
  if (NON_SKILL_EXPERTISE_PATTERN.test(name)) return false;
  if (!EXPERTISE_TRAIT_PATTERN.test(name)) return false;
  const text = `${name} ${description ?? ""}`.toLowerCase();
  return (
    text.includes("gain expertise") ||
    text.includes("for expertise") ||
    text.includes("to gain expertise") ||
    name.includes("Expertise")
  );
}

export function parseExpertiseChoiceCount(
  name: string,
  description: string | null,
): number {
  const text = `${name} ${description ?? ""}`.toLowerCase();
  if (/choose two|two more|two of|two additional|two skill/.test(text)) {
    return 2;
  }
  if (/choose one|one of|one skill|one proficient|expertise in one/.test(text)) {
    return 1;
  }
  if (/choose three|three skill/.test(text)) return 3;
  return 2;
}

export function parseExpertisePool(
  name: string,
  description: string | null,
  fixedSkillIds: number[],
): BuilderExpertiseGroup["pool"] {
  if (fixedSkillIds.length > 0) return "fixed";
  const text = `${name} ${description ?? ""}`.toLowerCase();
  if (text.includes("ranger skill") || text.includes("class skill")) {
    return "class_skills";
  }
  return "proficient";
}

export function expertiseGroupKey(traitId: number, levelRequired: number): string {
  return `${traitId}:${levelRequired}`;
}

export function formatExpertiseGroupLabel(group: BuilderExpertiseGroup): string {
  return group.level_required > 1
    ? `${group.trait_name} (nível ${group.level_required})`
    : group.trait_name;
}

export function classRequiresExpertiseSelection(
  expertiseChoices: BuilderExpertiseGroup[] | null | undefined,
): boolean {
  return (expertiseChoices?.length ?? 0) > 0;
}

export function totalExpertiseChoicesRequired(
  expertiseChoices: BuilderExpertiseGroup[],
): number {
  return expertiseChoices.reduce((sum, group) => sum + group.choice_count, 0);
}

export function proficientSkillOptions(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
): BuilderSkillOption[] {
  const background = data.backgrounds.find((b) => b.id === state.background_id);
  const cls = data.classes.find((c) => c.id === state.class_id);

  const byId = new Map<number, BuilderSkillOption>();

  for (const skill of background?.skill_proficiencies ?? []) {
    byId.set(skill.skill_id, skill);
  }

  if (cls) {
    for (const group of cls.skill_choices) {
      for (const skill of group.options) {
        if (state.class_skill_ids.includes(skill.skill_id)) {
          byId.set(skill.skill_id, skill);
        }
      }
    }
  }

  return [...byId.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR"),
  );
}

export function eligibleSkillsForExpertiseGroup(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
  group: BuilderExpertiseGroup,
): BuilderSkillOption[] {
  const proficient = proficientSkillOptions(data, state);

  switch (group.pool) {
    case "fixed": {
      const allowed = new Set(group.fixed_skills.map((s) => s.skill_id));
      return proficient.filter((skill) => allowed.has(skill.skill_id));
    }
    case "class_skills": {
      const cls = data.classes.find((c) => c.id === state.class_id);
      const classSkillIds = new Set(state.class_skill_ids);
      const classOptions = new Map<number, BuilderSkillOption>();
      for (const choiceGroup of cls?.skill_choices ?? []) {
        for (const skill of choiceGroup.options) {
          classOptions.set(skill.skill_id, skill);
        }
      }
      return [...classSkillIds]
        .map((id) => classOptions.get(id))
        .filter((skill): skill is BuilderSkillOption => skill !== undefined)
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    }
    case "proficient":
    default:
      return proficient;
  }
}

export function getExpertiseSelectionsForTrait(
  state: CharacterBuilderState,
  group: Pick<BuilderExpertiseGroup, "trait_id" | "level_required">,
): number[] {
  const key = expertiseGroupKey(group.trait_id, group.level_required);
  return state.expertise_by_trait[key] ?? [];
}

export function toggleExpertiseSkill(
  state: CharacterBuilderState,
  group: Pick<BuilderExpertiseGroup, "trait_id" | "level_required">,
  skillId: number,
  max: number,
): CharacterBuilderState {
  const key = expertiseGroupKey(group.trait_id, group.level_required);
  const current = getExpertiseSelectionsForTrait(state, group);
  const nextForTrait = current.includes(skillId)
    ? current.filter((id) => id !== skillId)
    : current.length >= max
      ? current
      : [...current, skillId];

  return {
    ...state,
    expertise_by_trait: {
      ...state.expertise_by_trait,
      [key]: nextForTrait,
    },
  };
}

export function validateExpertiseSelections(
  cls: BuilderClassEntry | null | undefined,
  data: CharacterBuilderData,
  state: CharacterBuilderState,
): string | null {
  const groups = cls?.expertise_choices ?? [];
  if (!groups.length) return null;

  for (const group of groups) {
    const selected = getExpertiseSelectionsForTrait(state, group);
    if (selected.length !== group.choice_count) {
      return `Selecione ${group.choice_count} perícia(s) com expertise: ${formatExpertiseGroupLabel(group)}.`;
    }

    const eligible = new Set(
      eligibleSkillsForExpertiseGroup(data, state, group).map((s) => s.skill_id),
    );
    for (const skillId of selected) {
      if (!eligible.has(skillId)) {
        return `Perícia inválida para expertise (${formatExpertiseGroupLabel(group)}).`;
      }
    }
  }

  return null;
}

function coreProficientSkillIds(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
): Set<number> {
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

  const speciesOptions = (species?.traits ?? []).flatMap((trait) =>
    trait.choice_groups.flatMap((group) => group.options),
  );
  for (const skillId of skillIdsFromTraitSelections(
    state.species_trait_options,
    speciesOptions,
    data.skills,
  )) {
    ids.add(skillId);
  }

  const backgroundFeatOptions = (background?.origin_feat_choices ?? []).flatMap(
    (group) => group.options,
  );
  for (const skillId of skillIdsFromTraitSelections(
    state.origin_feat_trait_options,
    backgroundFeatOptions,
    data.skills,
  )) {
    ids.add(skillId);
  }

  const humanFeatOptions = (humanFeat?.origin_feat_choices ?? []).flatMap(
    (group) => group.options,
  );
  for (const skillId of skillIdsFromTraitSelections(
    state.human_origin_feat_trait_options,
    humanFeatOptions,
    data.skills,
  )) {
    ids.add(skillId);
  }

  return ids;
}

function skillIdsFromTraitSelections(
  selections: CharacterBuilderState["progression_feat_trait_options"],
  options: BuilderTraitOption[],
  skills: CharacterBuilderData["skills"],
): number[] {
  const byOptionId = new Map(options.map((opt) => [opt.trait_option_id, opt]));
  const ids: number[] = [];

  for (const selection of selections) {
    const option = byOptionId.get(selection.trait_option_id);
    if (!option) continue;
    const skillId =
      option.skill_id ??
      skills.find((skill) => skill.name === option.name)?.skill_id;
    if (skillId != null) ids.push(skillId);
  }

  return ids;
}

function expertiseSkillIdsFromProgressionFeats(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
): Set<number> {
  const result = new Set<number>();
  const baseProficient = coreProficientSkillIds(data, state);

  for (const slot of syncProgressionFeatSlots(state)) {
    if (slot.kind !== "feat" || !slot.feat_id) continue;

    const feat = data.progression_feats.find((entry) => entry.id === slot.feat_id);
    if (!feat) continue;

    const selections = progressionTraitOptionsForSlot(state, slot.at_level);

    for (const group of feat.origin_feat_choices) {
      if (!isSkillProficiencyOptionGroup(group.option_group)) continue;
      if (!grantsExpertiseIfAlreadyProficient(group.trait_description)) continue;

      for (const selection of selections) {
        if (
          selection.trait_id !== group.trait_id ||
          selection.option_group !== group.option_group
        ) {
          continue;
        }

        const option = group.options.find(
          (entry) => entry.trait_option_id === selection.trait_option_id,
        );
        if (!option) continue;

        const skillId =
          option.skill_id ??
          data.skills.find((skill) => skill.name === option.name)?.skill_id;
        if (skillId != null && baseProficient.has(skillId)) {
          result.add(skillId);
        }
      }
    }
  }

  return result;
}

export function buildSkillsPayloadWithExpertise(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
): { skill_id: number; is_proficient: boolean; has_expertise: boolean }[] {
  const classExpertiseIds = new Set(
    Object.values(state.expertise_by_trait).flat(),
  );
  const featExpertiseIds = expertiseSkillIdsFromProgressionFeats(data, state);
  const allProficientIds = proficientSkillIds(data, state);

  return allProficientIds.map((skill_id) => ({
    skill_id,
    is_proficient: true,
    has_expertise:
      classExpertiseIds.has(skill_id) || featExpertiseIds.has(skill_id),
  }));
}
