import { ApiError } from "@/lib/api/errors";
import type {
  BuilderClassEntry,
  BuilderClassFeature,
  BuilderSkillChoiceGroup,
  BuilderSubclassSummary,
  BuilderToolChoiceGroup,
} from "@/features/character-builder/types/builder.types";
import type { BuilderAdminClient } from "./types";
import { fetchAllClassExpertiseChoices, fetchClassExpertiseChoices } from "./fetch-class-expertise";
import {
  fetchAllClassSpellcasting,
  fetchClassSpellcasting,
} from "./fetch-class-spellcasting";

type SkillOptionRow = {
  class_id?: number;
  choice_group: string;
  skill_id: number;
  skills: { name: string; base_attribute: string } | { name: string; base_attribute: string }[] | null;
};

type ToolOptionRow = {
  class_id?: number;
  option_group: string;
  choice_count: number;
  name: string;
  tool_id: number | null;
  tool_category: string | null;
  notes: string | null;
};

type TraitRow = {
  id: number;
  name: string;
  description: string | null;
};

type ClassTraitRow = {
  class_id: number;
  trait_id: number;
  level_required: number;
  traits: TraitRow | TraitRow[] | null;
};

type SubclassRow = {
  class_id: number;
  id: number;
  name: string;
  description: string | null;
};

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapSkillChoiceGroups(
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
        const skill = Array.isArray(opt.skills) ? opt.skills[0] : opt.skills;
        return {
          skill_id: opt.skill_id,
          name: skill?.name ?? "Perícia",
          base_attribute: skill?.base_attribute ?? "STR",
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
  }));
}

function mapToolChoiceGroups(
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

function mapClassProficiencies(
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

function mapClassFeature(row: ClassTraitRow): BuilderClassFeature | null {
  const trait = one(row.traits);
  if (!trait) return null;

  return {
    trait_id: row.trait_id,
    name: trait.name,
    description: trait.description,
    level_required: row.level_required,
  };
}

async function fetchClassFeatures(
  admin: BuilderAdminClient,
  classId: number,
): Promise<BuilderClassFeature[]> {
  const { data, error } = await admin
    .from("class_traits")
    .select("class_id, trait_id, level_required, traits(id, name, description)")
    .eq("class_id", classId)
    .order("level_required");

  if (error) throw new ApiError(error.message, 400);

  return ((data ?? []) as ClassTraitRow[])
    .map(mapClassFeature)
    .filter((feature): feature is BuilderClassFeature => feature !== null);
}

async function fetchAllClassFeatures(
  admin: BuilderAdminClient,
): Promise<Map<number, BuilderClassFeature[]>> {
  const { data, error } = await admin
    .from("class_traits")
    .select("class_id, trait_id, level_required, traits(id, name, description)")
    .order("level_required");

  if (error) throw new ApiError(error.message, 400);

  const featuresByClass = new Map<number, BuilderClassFeature[]>();

  for (const row of (data ?? []) as ClassTraitRow[]) {
    const feature = mapClassFeature(row);
    if (!feature) continue;

    const list = featuresByClass.get(row.class_id) ?? [];
    list.push(feature);
    featuresByClass.set(row.class_id, list);
  }

  return featuresByClass;
}

async function fetchClassSubclasses(
  admin: BuilderAdminClient,
  classId: number,
): Promise<BuilderSubclassSummary[]> {
  const { data, error } = await admin
    .from("subclasses")
    .select("class_id, id, name, description")
    .eq("class_id", classId)
    .order("name");

  if (error) throw new ApiError(error.message, 400);

  return ((data ?? []) as SubclassRow[]).map(({ id, name, description }) => ({
    id,
    name,
    description,
  }));
}

async function fetchAllClassSubclasses(
  admin: BuilderAdminClient,
): Promise<Map<number, BuilderSubclassSummary[]>> {
  const { data, error } = await admin
    .from("subclasses")
    .select("class_id, id, name, description")
    .order("name");

  if (error) throw new ApiError(error.message, 400);

  const subclassesByClass = new Map<number, BuilderSubclassSummary[]>();

  for (const row of (data ?? []) as SubclassRow[]) {
    const list = subclassesByClass.get(row.class_id) ?? [];
    list.push({
      id: row.id,
      name: row.name,
      description: row.description,
    });
    subclassesByClass.set(row.class_id, list);
  }

  return subclassesByClass;
}

export async function fetchClassById(
  admin: BuilderAdminClient,
  classId: number,
): Promise<BuilderClassEntry | null> {
  const { data: cls, error } = await admin
    .from("classes")
    .select("id, name, hit_die")
    .eq("id", classId)
    .maybeSingle();

  if (error) throw new ApiError(error.message, 400);
  if (!cls) return null;

  const { data: proficiencies, error: profError } = await admin
    .from("v_class_proficiency_details")
    .select(
      "class_id, proficiency_type, name, skill_id, tool_id, tool_category, requires_choice, choice_count, notes",
    )
    .eq("class_id", classId);

  if (profError) throw new ApiError(profError.message, 400);

  const { data: skillGroups, error: skillGroupError } = await admin
    .from("class_skill_choice_groups")
    .select("class_id, choice_group, choice_count, notes")
    .eq("class_id", classId);

  if (skillGroupError) throw new ApiError(skillGroupError.message, 400);

  const { data: skillOptions, error: skillOptionsError } = await admin
    .from("class_skill_options")
    .select("class_id, choice_group, skill_id, skills(name, base_attribute)")
    .eq("class_id", classId);

  if (skillOptionsError) throw new ApiError(skillOptionsError.message, 400);

  const { data: toolOptions, error: toolOptionsError } = await admin
    .from("class_tool_proficiency_options")
    .select(
      "class_id, option_group, choice_count, name, tool_id, tool_category, notes",
    )
    .eq("class_id", classId);

  if (toolOptionsError) throw new ApiError(toolOptionsError.message, 400);

  const [spellcasting, expertise_choices, features, subclasses] = await Promise.all([
    fetchClassSpellcasting(admin, classId, cls.name),
    fetchClassExpertiseChoices(admin, classId),
    fetchClassFeatures(admin, classId),
    fetchClassSubclasses(admin, classId),
  ]);

  return {
    id: cls.id,
    name: cls.name,
    hit_die: cls.hit_die,
    ...mapClassProficiencies(proficiencies ?? []),
    skill_choices: mapSkillChoiceGroups(skillGroups ?? [], skillOptions ?? []),
    tool_choices: mapToolChoiceGroups(toolOptions ?? []),
    spellcasting,
    expertise_choices,
    features,
    subclasses,
  };
}

export async function fetchClassesSummary(admin: BuilderAdminClient) {
  const [
    { data: classes, error },
    { data: proficiencies, error: profError },
    expertiseByClass,
    spellcastingByClass,
    featuresByClass,
    subclassesByClass,
  ] = await Promise.all([
    admin.from("classes").select("id, name, hit_die").order("name"),
    admin
      .from("v_class_proficiency_details")
      .select("class_id, proficiency_type, name")
      .eq("requires_choice", false),
    fetchAllClassExpertiseChoices(admin),
    fetchAllClassSpellcasting(admin),
    fetchAllClassFeatures(admin),
    fetchAllClassSubclasses(admin),
  ]);

  if (error) throw new ApiError(error.message, 400);
  if (profError) throw new ApiError(profError.message, 400);

  return (classes ?? []).map((cls) => {
    const classProfs = (proficiencies ?? []).filter((p) => p.class_id === cls.id);
    return {
      id: cls.id,
      name: cls.name,
      hit_die: cls.hit_die,
      ...mapClassProficiencies(classProfs),
      skill_choices: [] as BuilderSkillChoiceGroup[],
      tool_choices: [] as BuilderToolChoiceGroup[],
      spellcasting: spellcastingByClass.get(cls.id) ?? null,
      expertise_choices: expertiseByClass.get(cls.id) ?? [],
      features: featuresByClass.get(cls.id) ?? [],
      subclasses: subclassesByClass.get(cls.id) ?? [],
    } satisfies BuilderClassEntry;
  });
}
