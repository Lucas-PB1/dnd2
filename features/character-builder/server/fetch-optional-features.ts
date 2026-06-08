import { ApiError } from "@/lib/api/errors";
import type {
  BuilderOptionalFeatureGroup,
  BuilderTraitOption,
} from "@/features/character-builder/types/builder.types";
import type { BuilderAdminClient } from "./types";
import { normalizeBuilderClassLevel } from "./types";

type TraitLink = {
  trait_id: number;
  level_required: number;
  traits: {
    id: number;
    name: string;
    description: string | null;
  } | {
    id: number;
    name: string;
    description: string | null;
  }[] | null;
};

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function traitAppliesToSubclass(
  traitName: string,
  subclassName: string | null,
): boolean {
  const match = traitName.match(/\(([^)]+)\):/);
  if (!match) return true;
  return subclassName !== null && match[1] === subclassName;
}

function tabLabelForGroup(traitName: string, optionGroup: string): string {
  if (traitName.includes("Combat Superiority") || optionGroup === "maneuver") {
    return "Manobras";
  }
  if (traitName.includes("Eldritch Invocations")) {
    return "Invocações";
  }
  if (optionGroup === "fighting_style" || traitName.includes("Fighting Style")) {
    return "Estilo de luta";
  }
  if (traitName.includes("Divine Order")) return "Ordem divina";
  if (traitName.includes("Primal Order")) return "Ordem primal";
  if (traitName.includes("Metamagic")) return "Metamagic";
  return traitName.replace(/^[^:]+:\s*/, "");
}

function metamagicChoiceCount(classLevel: number): number {
  if (classLevel >= 17) return 6;
  if (classLevel >= 10) return 4;
  if (classLevel >= 2) return 2;
  return 0;
}

async function resolveChoiceCount(
  admin: BuilderAdminClient,
  traitName: string,
  optionGroup: string,
  classLevel: number,
  defaultCount: number,
): Promise<number> {
  const level = normalizeBuilderClassLevel(classLevel);

  if (traitName.includes("Eldritch Invocations")) {
    const { data, error } = await admin
      .from("spell_knowledge_by_level")
      .select("knowledge_count")
      .eq("progression_slug", "warlock-invocations")
      .eq("class_level", level)
      .maybeSingle();
    if (error) throw new ApiError(error.message, 400);
    if (data?.knowledge_count) return data.knowledge_count;
  }

  if (traitName === "Sorcerer: Metamagic" && optionGroup === "metamagic") {
    return metamagicChoiceCount(level);
  }

  if (
    traitName.includes("Combat Superiority") &&
    optionGroup === "maneuver"
  ) {
    const { data: traitResource, error: resourceError } = await admin
      .from("trait_resources")
      .select("id, traits!inner(name)")
      .eq("resource_key", "feature-battle-master-maneuvers-known")
      .eq("traits.name", traitName)
      .maybeSingle();

    if (resourceError) throw new ApiError(resourceError.message, 400);
    if (traitResource?.id) {
      const { data, error } = await admin
        .from("trait_resource_progressions")
        .select("resource_count")
        .eq("trait_resource_id", traitResource.id)
        .eq("class_level", level)
        .maybeSingle();
      if (error) throw new ApiError(error.message, 400);
      if (data?.resource_count) return data.resource_count;
    }
  }

  return defaultCount;
}

export async function fetchClassOptionalFeatures(
  admin: BuilderAdminClient,
  classId: number,
  classLevel: number,
  subclassId: number | null,
  subclassName: string | null,
): Promise<BuilderOptionalFeatureGroup[]> {
  const level = normalizeBuilderClassLevel(classLevel);

  const [{ data: classLinks, error: classError }, subclassQuery] =
    await Promise.all([
      admin
        .from("class_traits")
        .select("trait_id, level_required, traits(id, name, description)")
        .eq("class_id", classId)
        .lte("level_required", level),
      subclassId
        ? admin
            .from("subclass_traits")
            .select("trait_id, level_required, traits(id, name, description)")
            .eq("subclass_id", subclassId)
            .lte("level_required", level)
        : Promise.resolve({ data: null, error: null }),
    ]);

  if (classError) throw new ApiError(classError.message, 400);
  if (subclassQuery.error) throw new ApiError(subclassQuery.error.message, 400);

  const traitLinks = [...(classLinks ?? []), ...(subclassQuery.data ?? [])].filter(
    (link) => {
      const trait = one(link.traits);
      if (!trait) return false;
      return traitAppliesToSubclass(trait.name, subclassName);
    },
  );

  const traitIds = [...new Set(traitLinks.map((link) => link.trait_id))];
  if (!traitIds.length) return [];

  const [{ data: groups, error: groupError }, { data: options, error: optionError }] =
    await Promise.all([
      admin
        .from("trait_option_groups")
        .select("trait_id, option_group, choice_count, is_required, notes")
        .in("trait_id", traitIds)
        .eq("is_required", true),
      admin
        .from("trait_options")
        .select(
          "id, trait_id, option_group, name, description, sort_order, skill_id",
        )
        .in("trait_id", traitIds)
        .order("sort_order"),
    ]);

  if (groupError) throw new ApiError(groupError.message, 400);
  if (optionError) throw new ApiError(optionError.message, 400);

  const levelByTrait = new Map<number, number>();
  for (const link of traitLinks) {
    const current = levelByTrait.get(link.trait_id);
    if (current === undefined || link.level_required < current) {
      levelByTrait.set(link.trait_id, link.level_required);
    }
  }

  const result: BuilderOptionalFeatureGroup[] = [];

  for (const group of groups ?? []) {
    const traitLink = traitLinks.find((link) => link.trait_id === group.trait_id);
    const trait = traitLink ? one(traitLink.traits) : null;
    if (!trait) continue;

    const groupOptions = (options ?? [])
      .filter(
        (opt) =>
          opt.trait_id === group.trait_id &&
          opt.option_group === group.option_group,
      )
      .map(
        (opt): BuilderTraitOption => ({
          trait_option_id: opt.id,
          name: opt.name,
          description: opt.description,
          option_group: opt.option_group,
          skill_id: opt.skill_id,
        }),
      );

    if (groupOptions.length === 0) continue;

    const choice_count = await resolveChoiceCount(
      admin,
      trait.name,
      group.option_group,
      level,
      group.choice_count,
    );

    if (choice_count <= 0) continue;

    result.push({
      group_key: `${group.trait_id}:${group.option_group}`,
      trait_id: group.trait_id,
      trait_name: trait.name,
      trait_description: trait.description,
      option_group: group.option_group,
      choice_count,
      level_required: levelByTrait.get(group.trait_id) ?? 1,
      tab_label: tabLabelForGroup(trait.name, group.option_group),
      notes: group.notes ?? null,
      options: groupOptions,
    });
  }

  return result.sort(
    (a, b) =>
      a.level_required - b.level_required ||
      a.trait_name.localeCompare(b.trait_name, "pt-BR"),
  );
}
