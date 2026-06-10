import { ApiError } from "@/lib/api/errors";
import type {
  BuilderClassEntry,
  BuilderToolChoiceGroup,
} from "@/features/character-builder/types/builder.types";
import type { BuilderAdminClient } from "./types";
import {
  mapClassProficiencies,
  mapSkillChoiceGroups,
  mapToolChoiceGroups,
} from "./class-mappers";
import {
  fetchAllClassFeatures,
  fetchAllClassSubclasses,
  fetchClassFeatures,
  fetchClassSubclasses,
} from "./fetch-class-features";
import { fetchAllClassSkillChoiceGroups } from "./fetch-class-skills";
import {
  fetchAllClassExpertiseChoices,
  fetchClassExpertiseChoices,
} from "./fetch-class-expertise";
import { fetchClassOptionalFeatures } from "./fetch-optional-features";
import {
  fetchAllClassSpellcasting,
  fetchClassSpellcasting,
} from "./fetch-class-spellcasting";

export async function fetchClassById(
  admin: BuilderAdminClient,
  classId: number,
  classLevel: number,
  subclassId: number | null = null,
): Promise<BuilderClassEntry | null> {
  const { data: cls, error } = await admin
    .from("classes")
    .select("id, name, hit_die")
    .eq("id", classId)
    .maybeSingle();

  if (error) throw new ApiError(error.message, 400);
  if (!cls) return null;

  const [
    { data: proficiencies, error: profError },
    { data: skillGroups, error: skillGroupError },
    { data: skillOptions, error: skillOptionsError },
    { data: toolOptions, error: toolOptionsError },
    spellcasting,
    expertise_choices,
    features,
    subclasses,
  ] = await Promise.all([
    admin
      .from("v_class_proficiency_details")
      .select(
        "class_id, proficiency_type, name, skill_id, tool_id, tool_category, requires_choice, choice_count, notes",
      )
      .eq("class_id", classId),
    admin
      .from("class_skill_choice_groups")
      .select("class_id, choice_group, choice_count, notes")
      .eq("class_id", classId),
    admin
      .from("class_skill_options")
      .select("class_id, choice_group, skill_id, skills(name, base_attribute)")
      .eq("class_id", classId),
    admin
      .from("class_tool_proficiency_options")
      .select(
        "class_id, option_group, choice_count, name, tool_id, tool_category, notes",
      )
      .eq("class_id", classId),
    fetchClassSpellcasting(admin, classId, cls.name, classLevel),
    fetchClassExpertiseChoices(admin, classId, classLevel),
    fetchClassFeatures(admin, classId),
    fetchClassSubclasses(admin, classId),
  ]);

  if (profError) throw new ApiError(profError.message, 400);
  if (skillGroupError) throw new ApiError(skillGroupError.message, 400);
  if (skillOptionsError) throw new ApiError(skillOptionsError.message, 400);
  if (toolOptionsError) throw new ApiError(toolOptionsError.message, 400);

  const selectedSubclass = subclassId
    ? subclasses.find((entry) => entry.id === subclassId)
    : null;
  const optional_feature_groups = await fetchClassOptionalFeatures(
    admin,
    classId,
    classLevel,
    subclassId,
    selectedSubclass?.name ?? null,
  );

  return {
    id: cls.id,
    name: cls.name,
    hit_die: cls.hit_die,
    ...mapClassProficiencies(proficiencies ?? []),
    skill_choices: mapSkillChoiceGroups(skillGroups ?? [], skillOptions ?? []),
    tool_choices: mapToolChoiceGroups(toolOptions ?? []),
    spellcasting,
    expertise_choices,
    optional_feature_groups,
    features,
    subclasses,
  };
}

export async function fetchClassesSummary(
  admin: BuilderAdminClient,
  classLevel: number,
) {
  const [
    { data: classes, error },
    { data: proficiencies, error: profError },
    expertiseByClass,
    spellcastingByClass,
    featuresByClass,
    subclassesByClass,
    skillChoicesByClass,
  ] = await Promise.all([
    admin.from("classes").select("id, name, hit_die").order("name"),
    admin
      .from("v_class_proficiency_details")
      .select("class_id, proficiency_type, name")
      .eq("requires_choice", false),
    fetchAllClassExpertiseChoices(admin, classLevel),
    fetchAllClassSpellcasting(admin, classLevel),
    fetchAllClassFeatures(admin),
    fetchAllClassSubclasses(admin),
    fetchAllClassSkillChoiceGroups(admin),
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
      skill_choices: skillChoicesByClass.get(cls.id) ?? [],
      tool_choices: [] as BuilderToolChoiceGroup[],
      spellcasting: spellcastingByClass.get(cls.id) ?? null,
      expertise_choices: expertiseByClass.get(cls.id) ?? [],
      optional_feature_groups: [],
      features: featuresByClass.get(cls.id) ?? [],
      subclasses: subclassesByClass.get(cls.id) ?? [],
    } satisfies BuilderClassEntry;
  });
}
