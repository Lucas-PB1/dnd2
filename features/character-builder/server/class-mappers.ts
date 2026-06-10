import type {
  BuilderSkillChoiceGroup,
  BuilderToolChoiceGroup,
} from "@/features/character-builder/types/builder.types";

export type SkillOptionRow = {
  class_id?: number;
  choice_group: string;
  skill_id: number;
  skills:
    | { name: string; base_attribute: string }
    | { name: string; base_attribute: string }[]
    | null;
};

export type ToolOptionRow = {
  class_id?: number;
  option_group: string;
  choice_count: number;
  name: string;
  tool_id: number | null;
  tool_category: string | null;
  notes: string | null;
};

export function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function mapSkillChoiceGroups(
  skillGroups: { choice_group: string; choice_count: number; notes: string | null }[],
  skillOptions: SkillOptionRow[],
  classId?: number,
): BuilderSkillChoiceGroup[] {
  return skillGroups.map((group) => ({
    choice_group: group.choice_group,
    choice_count: group.choice_count,
    notes: group.notes,
    options: skillOptions
      .filter(
        (opt) =>
          (classId === undefined || opt.class_id === classId) &&
          opt.choice_group === group.choice_group,
      )
      .map((opt) => {
        const skill = one(opt.skills);
        return {
          skill_id: opt.skill_id,
          name: skill?.name ?? "Perícia",
          base_attribute: skill?.base_attribute ?? "STR",
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
  }));
}

export function mapToolChoiceGroups(
  toolOptions: ToolOptionRow[],
  classId?: number,
): BuilderToolChoiceGroup[] {
  return toolOptions
    .filter((opt) => classId === undefined || opt.class_id === classId)
    .reduce<BuilderToolChoiceGroup[]>((acc, row) => {
      let group = acc.find((entry) => entry.option_group === row.option_group);
      if (!group) {
        group = {
          option_group: row.option_group,
          choice_count: row.choice_count,
          notes: row.notes,
          tool_category: row.tool_category,
          options: [],
        };
        acc.push(group);
      }
      group.options.push({
        tool_id: row.tool_id,
        name: row.name,
        category: row.tool_category,
      });
      return acc;
    }, []);
}

export function mapClassProficiencies(
  classProfs: { proficiency_type: string; name: string }[],
) {
  return {
    saving_throws: classProfs
      .filter((p) => p.proficiency_type === "save")
      .map((p) => p.name),
    weapons: classProfs
      .filter((p) => p.proficiency_type === "weapon")
      .map((p) => p.name),
    armor: classProfs
      .filter((p) => p.proficiency_type === "armor")
      .map((p) => p.name),
  };
}
