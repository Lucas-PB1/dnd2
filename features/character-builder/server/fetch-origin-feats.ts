import { ApiError } from "@/lib/api/errors";
import type {
  BuilderFeatSpellcasting,
  BuilderFeatSpellGroup,
  BuilderOriginFeat,
  BuilderOriginFeatChoice,
  BuilderSpellOption,
  BuilderTraitOption,
  BuilderTraitOptionModifier,
} from "@/features/character-builder/types/builder.types";
import type { BuilderAdminClient } from "./types";

type TraitOptionModifierRow = {
  trait_option_id: number;
  choice_mode_key: string | null;
  affected_stat: string | null;
  operation: string;
  modifier_value: number;
  max_value: number | null;
};

function mapModifiersByOption(
  rows: TraitOptionModifierRow[] | null | undefined,
): Map<number, BuilderTraitOptionModifier[]> {
  const byOption = new Map<number, BuilderTraitOptionModifier[]>();

  for (const row of rows ?? []) {
    const list = byOption.get(row.trait_option_id) ?? [];
    list.push({
      choice_mode_key: row.choice_mode_key,
      affected_stat: row.affected_stat,
      operation: row.operation,
      modifier_value: row.modifier_value,
      max_value: row.max_value,
    });
    byOption.set(row.trait_option_id, list);
  }

  return byOption;
}

export async function fetchOriginFeatChoicesBatch(
  admin: BuilderAdminClient,
  featIds: number[],
): Promise<Map<number, BuilderOriginFeatChoice[]>> {
  const uniqueIds = [...new Set(featIds.filter((id) => id > 0))];
  const result = new Map<number, BuilderOriginFeatChoice[]>();
  if (!uniqueIds.length) return result;

  const { data: featTraits, error } = await admin
    .from("feat_traits")
    .select("feat_id, trait_id, traits(id, name, description)")
    .in("feat_id", uniqueIds);

  if (error) throw new ApiError(error.message, 400);

  const traitIds = [...new Set((featTraits ?? []).map((row) => row.trait_id))];
  if (!traitIds.length) return result;

  const { data: groups, error: groupError } = await admin
    .from("trait_option_groups")
    .select("trait_id, option_group, choice_count, is_required, notes")
    .in("trait_id", traitIds);

  if (groupError) throw new ApiError(groupError.message, 400);

  const { data: options, error: optionError } = await admin
    .from("trait_options")
    .select(
      "id, trait_id, option_group, name, description, sort_order, skill_id",
    )
    .in("trait_id", traitIds)
    .order("sort_order");

  if (optionError) throw new ApiError(optionError.message, 400);

  const optionIds = (options ?? []).map((option) => option.id);
  const { data: modifierRows, error: modifierError } = optionIds.length
    ? await admin
        .from("trait_option_modifiers")
        .select(
          "trait_option_id, choice_mode_key, affected_stat, operation, modifier_value, max_value",
        )
        .in("trait_option_id", optionIds)
    : { data: [], error: null };

  if (modifierError) throw new ApiError(modifierError.message, 400);

  const modifiersByOption = mapModifiersByOption(
    modifierRows as TraitOptionModifierRow[],
  );

  for (const featId of uniqueIds) {
    const traitsForFeat = (featTraits ?? []).filter((row) => row.feat_id === featId);
    const choices: BuilderOriginFeatChoice[] = (groups ?? [])
      .filter((group) =>
        traitsForFeat.some((link) => link.trait_id === group.trait_id),
      )
      .map((group) => {
        const traitLink = traitsForFeat.find(
          (row) => row.trait_id === group.trait_id,
        );
        const trait = traitLink
          ? Array.isArray(traitLink.traits)
            ? traitLink.traits[0]
            : traitLink.traits
          : null;

        return {
          trait_id: group.trait_id,
          trait_name: trait?.name ?? "Escolha",
          trait_description: trait?.description ?? null,
          option_group: group.option_group,
          choice_count: group.choice_count,
          is_required: group.is_required,
          options: (options ?? [])
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
                modifiers: modifiersByOption.get(opt.id) ?? [],
              }),
            ),
        } satisfies BuilderOriginFeatChoice;
      });

    result.set(featId, choices);
  }

  return result;
}

export async function fetchOriginFeatChoices(
  admin: BuilderAdminClient,
  featId: number | null,
): Promise<BuilderOriginFeatChoice[]> {
  if (!featId) return [];
  const batch = await fetchOriginFeatChoicesBatch(admin, [featId]);
  return batch.get(featId) ?? [];
}

export async function fetchFeatSpellcasting(
  admin: BuilderAdminClient,
  featId: number | null,
  featName: string | null,
): Promise<BuilderFeatSpellcasting | null> {
  if (!featId) return null;

  const { data: featTraits, error: featTraitError } = await admin
    .from("feat_traits")
    .select("trait_id, traits(id, name)")
    .eq("feat_id", featId);

  if (featTraitError) throw new ApiError(featTraitError.message, 400);

  const traitIds = [...new Set((featTraits ?? []).map((row) => row.trait_id))];
  if (!traitIds.length) return null;

  const { data: spellGroups, error: groupError } = await admin
    .from("trait_spell_choice_groups")
    .select(
      "trait_id, choice_group, choice_count, spell_level, spell_list_option_group, always_prepared, notes",
    )
    .in("trait_id", traitIds);

  if (groupError) throw new ApiError(groupError.message, 400);
  if (!spellGroups?.length) return null;

  const primaryTraitId = spellGroups[0].trait_id;
  const traitLink = (featTraits ?? []).find(
    (row) => row.trait_id === primaryTraitId,
  );
  const trait = traitLink
    ? Array.isArray(traitLink.traits)
      ? traitLink.traits[0]
      : traitLink.traits
    : null;
  const spellListOptionGroup =
    spellGroups.find((group) => group.spell_list_option_group)?.spell_list_option_group ??
    "Spell List";

  const { data: spellListOptions, error: spellListOptionError } = await admin
    .from("trait_options")
    .select("id, name, spell_list_id")
    .eq("trait_id", primaryTraitId)
    .eq("option_group", spellListOptionGroup)
    .not("spell_list_id", "is", null);

  if (spellListOptionError) {
    throw new ApiError(spellListOptionError.message, 400);
  }

  const listNames = (spellListOptions ?? []).map((option) => option.name);
  const spells_by_list: Record<string, BuilderSpellOption[]> = {};
  const spell_list_ids_by_name: Record<string, number> = {};

  for (const option of spellListOptions ?? []) {
    if (option.spell_list_id) {
      spell_list_ids_by_name[option.name] = option.spell_list_id;
    }
  }

  if (listNames.length) {
    const { data: spellRows, error: spellError } = await admin
      .from("v_spell_list_details")
      .select(
        "spell_list_name, spell_id, spell_name, level, school, requires_concentration, requires_ritual, save_attribute, attack_type, character_effect_summary",
      )
      .in("spell_list_name", listNames);

    if (spellError) throw new ApiError(spellError.message, 400);

    for (const row of spellRows ?? []) {
      const list = spells_by_list[row.spell_list_name] ?? [];
      list.push({
        spell_id: row.spell_id,
        name: row.spell_name,
        level: row.level,
        school: row.school,
        requires_concentration: row.requires_concentration,
        requires_ritual: row.requires_ritual,
        save_attribute: row.save_attribute,
        attack_type: row.attack_type,
        character_effect_summary: row.character_effect_summary?.trim() || null,
        description: row.character_effect_summary?.trim() || null,
      });
      spells_by_list[row.spell_list_name] = list;
    }

    for (const listName of Object.keys(spells_by_list)) {
      spells_by_list[listName].sort((a, b) =>
        a.name.localeCompare(b.name, "pt-BR"),
      );
    }
  }

  const groups: BuilderFeatSpellGroup[] = spellGroups
    .filter((group) => group.trait_id === primaryTraitId)
    .map((group) => ({
      trait_id: group.trait_id,
      choice_group: group.choice_group,
      choice_count: group.choice_count,
      spell_level: group.spell_level ?? 0,
      always_prepared: group.always_prepared,
      notes: group.notes,
    }));

  return {
    feat_id: featId,
    feat_name: featName ?? "Talent",
    trait_id: primaryTraitId,
    trait_name: trait?.name ?? "Magias do talento",
    spell_list_option_group: spellListOptionGroup,
    groups,
    spells_by_list,
    spell_list_ids_by_name,
  };
}

export async function fetchOriginFeatsEnriched(
  admin: BuilderAdminClient,
): Promise<BuilderOriginFeat[]> {
  const { data: feats, error } = await admin
    .from("feats")
    .select("id, name, description, is_repeatable")
    .eq("category", "Origin")
    .order("name");

  if (error) throw new ApiError(error.message, 400);

  const featIds = (feats ?? []).map((feat) => feat.id);
  const choicesById = await fetchOriginFeatChoicesBatch(admin, featIds);
  const spellcastingById = new Map<number, BuilderFeatSpellcasting | null>();

  await Promise.all(
    (feats ?? []).map(async (feat) => {
      spellcastingById.set(
        feat.id,
        await fetchFeatSpellcasting(admin, feat.id, feat.name),
      );
    }),
  );

  return (feats ?? []).map((feat) => ({
    ...feat,
    origin_feat_choices: choicesById.get(feat.id) ?? [],
    spellcasting: spellcastingById.get(feat.id) ?? null,
  }));
}
