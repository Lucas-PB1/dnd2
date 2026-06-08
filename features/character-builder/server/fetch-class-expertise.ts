import { ApiError } from "@/lib/api/errors";
import {
  formatExpertiseGroupLabel,
  isExpertiseTrait,
  parseExpertiseChoiceCount,
  parseExpertisePool,
} from "@/features/character-builder/domain/expertise/class-expertise";
import type { BuilderExpertiseGroup } from "@/features/character-builder/types/builder.types";
import type { BuilderAdminClient } from "./types";
import { normalizeBuilderClassLevel } from "./types";

function mapExpertiseTraitLinks(
  traitLinks: {
    class_id?: number;
    trait_id: number;
    level_required: number;
    traits: { id: number; name: string; description: string | null } | { id: number; name: string; description: string | null }[] | null;
  }[],
  traitOptions: {
    trait_id: number;
    option_group: string;
    name: string;
    skill_id: number | null;
    skills: { id: number; name: string; base_attribute: string } | { id: number; name: string; base_attribute: string }[] | null;
  }[],
  optionGroups: {
    trait_id: number;
    option_group: string;
    notes: string | null;
  }[],
): BuilderExpertiseGroup[] {
  const expertiseTraits = traitLinks.filter((link) => {
    const trait = Array.isArray(link.traits) ? link.traits[0] : link.traits;
    if (!trait) return false;
    return isExpertiseTrait(trait.name, trait.description);
  });

  const groups: BuilderExpertiseGroup[] = [];

  for (const link of expertiseTraits) {
    const trait = Array.isArray(link.traits) ? link.traits[0] : link.traits;
    if (!trait) continue;

    const fixed_skills = (traitOptions ?? [])
      .filter((opt) => opt.trait_id === trait.id && opt.skill_id !== null)
      .map((opt) => {
        const skill = Array.isArray(opt.skills) ? opt.skills[0] : opt.skills;
        return {
          skill_id: opt.skill_id as number,
          name: skill?.name ?? opt.name,
          base_attribute: skill?.base_attribute ?? "INT",
        };
      });

    const optionGroup = (optionGroups ?? []).find(
      (entry) => entry.trait_id === trait.id,
    );

    groups.push({
      trait_id: trait.id,
      level_required: link.level_required,
      trait_name: trait.name,
      choice_count: parseExpertiseChoiceCount(trait.name, trait.description),
      pool: parseExpertisePool(trait.name, trait.description, fixed_skills.map((s) => s.skill_id)),
      fixed_skills,
      notes: optionGroup?.notes ?? trait.description,
    });
  }

  return groups.sort(
    (a, b) =>
      a.level_required - b.level_required ||
      formatExpertiseGroupLabel(a).localeCompare(
        formatExpertiseGroupLabel(b),
        "pt-BR",
      ),
  );
}

export async function fetchClassExpertiseChoices(
  admin: BuilderAdminClient,
  classId: number,
  classLevel: number,
): Promise<BuilderExpertiseGroup[]> {
  const level = normalizeBuilderClassLevel(classLevel);
  const { data: traitLinks, error } = await admin
    .from("class_traits")
    .select("trait_id, level_required, traits(id, name, description)")
    .eq("class_id", classId)
    .lte("level_required", level);

  if (error) throw new ApiError(error.message, 400);

  const expertiseTraitIds = (traitLinks ?? [])
    .filter((link) => {
      const trait = Array.isArray(link.traits) ? link.traits[0] : link.traits;
      if (!trait) return false;
      return isExpertiseTrait(trait.name, trait.description);
    })
    .map((link) => link.trait_id);

  if (!expertiseTraitIds.length) return [];

  const [{ data: optionGroups, error: groupError }, { data: traitOptions, error: optionError }] =
    await Promise.all([
      admin
        .from("trait_option_groups")
        .select("trait_id, option_group, choice_count, notes")
        .in("trait_id", expertiseTraitIds),
      admin
        .from("trait_options")
        .select(
          "trait_id, option_group, name, skill_id, skills(id, name, base_attribute)",
        )
        .in("trait_id", expertiseTraitIds),
    ]);

  if (groupError) throw new ApiError(groupError.message, 400);
  if (optionError) throw new ApiError(optionError.message, 400);

  return mapExpertiseTraitLinks(
    traitLinks ?? [],
    traitOptions ?? [],
    optionGroups ?? [],
  );
}

export async function fetchAllClassExpertiseChoices(
  admin: BuilderAdminClient,
  classLevel: number,
): Promise<Map<number, BuilderExpertiseGroup[]>> {
  const level = normalizeBuilderClassLevel(classLevel);
  const { data: traitLinks, error } = await admin
    .from("class_traits")
    .select("class_id, trait_id, level_required, traits(id, name, description)")
    .lte("level_required", level);

  if (error) throw new ApiError(error.message, 400);

  const expertiseTraitIds = [
    ...new Set(
      (traitLinks ?? [])
        .filter((link) => {
          const trait = Array.isArray(link.traits) ? link.traits[0] : link.traits;
          if (!trait) return false;
          return isExpertiseTrait(trait.name, trait.description);
        })
        .map((link) => link.trait_id),
    ),
  ];

  const byClass = new Map<number, BuilderExpertiseGroup[]>();
  if (!expertiseTraitIds.length) return byClass;

  const [{ data: optionGroups, error: groupError }, { data: traitOptions, error: optionError }] =
    await Promise.all([
      admin
        .from("trait_option_groups")
        .select("trait_id, option_group, choice_count, notes")
        .in("trait_id", expertiseTraitIds),
      admin
        .from("trait_options")
        .select(
          "trait_id, option_group, name, skill_id, skills(id, name, base_attribute)",
        )
        .in("trait_id", expertiseTraitIds),
    ]);

  if (groupError) throw new ApiError(groupError.message, 400);
  if (optionError) throw new ApiError(optionError.message, 400);

  const classIds = [...new Set((traitLinks ?? []).map((link) => link.class_id))];
  for (const classId of classIds) {
    const classTraitLinks = (traitLinks ?? []).filter((link) => link.class_id === classId);
    byClass.set(
      classId,
      mapExpertiseTraitLinks(classTraitLinks, traitOptions ?? [], optionGroups ?? []),
    );
  }

  return byClass;
}
