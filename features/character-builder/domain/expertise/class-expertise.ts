import type {
  BuilderClassEntry,
  BuilderExpertiseGroup,
  BuilderSkillOption,
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";

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

export function buildSkillsPayloadWithExpertise(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
): { skill_id: number; is_proficient: boolean; has_expertise: boolean }[] {
  const expertiseIds = new Set(
    Object.values(state.expertise_by_trait).flat(),
  );
  const proficient = proficientSkillOptions(data, state);

  return proficient.map((skill) => ({
    skill_id: skill.skill_id,
    is_proficient: true,
    has_expertise: expertiseIds.has(skill.skill_id),
  }));
}
