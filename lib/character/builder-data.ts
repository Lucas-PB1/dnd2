import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/api/errors";
import { mergeBuilderData } from "@/lib/character/builder-merge";
import type {
  AbilityKey,
  BuilderBackgroundEntry,
  BuilderBackgroundSummaryEntry,
  BuilderBackgroundToolOption,
  BuilderClassEntry,
  BuilderEquipmentItem,
  BuilderEquipmentOption,
  BuilderOriginFeat,
  BuilderOriginFeatChoice,
  BuilderSkillChoiceGroup,
  BuilderSkillOption,
  BuilderSpeciesEntry,
  BuilderSpeciesSummaryEntry,
  BuilderSpeciesTrait,
  BuilderToolChoiceGroup,
  BuilderToolOption,
  BuilderTraitChoiceGroup,
  BuilderTraitOption,
  CharacterBuilderData,
  CharacterBuilderSummary,
} from "@/features/character/types/builder.types";

function parseAbilityOptions(raw: unknown): AbilityKey[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (value): value is AbilityKey =>
      typeof value === "string" &&
      ["STR", "DEX", "CON", "INT", "WIS", "CHA"].includes(value),
  );
}

function parseSkillProficiencies(raw: unknown): BuilderSkillOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (typeof entry !== "object" || entry === null) return null;
      const row = entry as Record<string, unknown>;
      if (typeof row.skill_id !== "number" || typeof row.name !== "string") {
        return null;
      }
      return {
        skill_id: row.skill_id,
        name: row.name,
        base_attribute:
          typeof row.base_attribute === "string" ? row.base_attribute : "STR",
      };
    })
    .filter((entry): entry is BuilderSkillOption => entry !== null);
}

function parseBackgroundTools(raw: unknown): BuilderBackgroundToolOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (typeof entry !== "object" || entry === null) return null;
      const row = entry as Record<string, unknown>;
      if (typeof row.id !== "number" || typeof row.name !== "string") {
        return null;
      }
      return {
        id: row.id,
        option_group:
          typeof row.option_group === "string" ? row.option_group : "Tool Proficiency",
        choice_count:
          typeof row.choice_count === "number" ? row.choice_count : 1,
        name: row.name,
        tool_id: typeof row.tool_id === "number" ? row.tool_id : null,
        tool_category:
          typeof row.tool_category === "string" ? row.tool_category : null,
        notes: typeof row.notes === "string" ? row.notes : null,
      };
    })
    .filter((entry): entry is BuilderBackgroundToolOption => entry !== null);
}

async function fetchClasses(admin: ReturnType<typeof createAdminClient>) {
  const { data: classes, error } = await admin
    .from("classes")
    .select("id, name, hit_die")
    .order("name");

  if (error) throw new ApiError(error.message, 400);

  const { data: proficiencies, error: profError } = await admin
    .from("v_class_proficiency_details")
    .select(
      "class_id, proficiency_type, name, skill_id, tool_id, tool_category, requires_choice, choice_count, notes",
    );

  if (profError) throw new ApiError(profError.message, 400);

  const { data: skillGroups, error: skillGroupError } = await admin
    .from("class_skill_choice_groups")
    .select("class_id, choice_group, choice_count, notes");

  if (skillGroupError) throw new ApiError(skillGroupError.message, 400);

  const { data: skillOptions, error: skillOptionsError } = await admin
    .from("class_skill_options")
    .select("class_id, choice_group, skill_id, skills(name, base_attribute)");

  if (skillOptionsError) throw new ApiError(skillOptionsError.message, 400);

  const { data: toolOptions, error: toolOptionsError } = await admin
    .from("class_tool_proficiency_options")
    .select(
      "class_id, option_group, choice_count, name, tool_id, tool_category, notes",
    );

  if (toolOptionsError) throw new ApiError(toolOptionsError.message, 400);

  return (classes ?? []).map((cls) => {
    const classProfs = (proficiencies ?? []).filter((p) => p.class_id === cls.id);

    const skill_choices: BuilderSkillChoiceGroup[] = (skillGroups ?? [])
      .filter((group) => group.class_id === cls.id)
      .map((group) => ({
        choice_group: group.choice_group,
        choice_count: group.choice_count,
        notes: group.notes,
        options: (skillOptions ?? [])
          .filter(
            (opt) =>
              opt.class_id === cls.id && opt.choice_group === group.choice_group,
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

    const tool_choices: BuilderToolChoiceGroup[] = (toolOptions ?? [])
      .filter((opt) => opt.class_id === cls.id)
      .reduce<BuilderToolChoiceGroup[]>((acc, row) => {
        let group = acc.find((g) => g.option_group === row.option_group);
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

    return {
      id: cls.id,
      name: cls.name,
      hit_die: cls.hit_die,
      saving_throws: classProfs
        .filter((p) => p.proficiency_type === "save")
        .map((p) => p.name),
      weapons: classProfs
        .filter((p) => p.proficiency_type === "weapon")
        .map((p) => p.name),
      armor: classProfs
        .filter((p) => p.proficiency_type === "armor")
        .map((p) => p.name),
      skill_choices,
      tool_choices,
    } satisfies BuilderClassEntry;
  });
}

async function fetchSpeciesTraits(
  admin: ReturnType<typeof createAdminClient>,
): Promise<Map<number, BuilderSpeciesTrait[]>> {
  const { data: links, error } = await admin
    .from("species_traits")
    .select("species_id, trait_id, traits(id, name, description)");

  if (error) throw new ApiError(error.message, 400);

  const traitIds = [...new Set((links ?? []).map((link) => link.trait_id))];

  const { data: groups, error: groupError } = await admin
    .from("trait_option_groups")
    .select("trait_id, option_group, choice_count, is_required, notes")
    .in("trait_id", traitIds.length ? traitIds : [-1]);

  if (groupError) throw new ApiError(groupError.message, 400);

  const { data: options, error: optionError } = await admin
    .from("trait_options")
    .select("id, trait_id, option_group, name, description, sort_order")
    .in("trait_id", traitIds.length ? traitIds : [-1])
    .order("sort_order");

  if (optionError) throw new ApiError(optionError.message, 400);

  const bySpecies = new Map<number, BuilderSpeciesTrait[]>();

  for (const link of links ?? []) {
    const trait = Array.isArray(link.traits) ? link.traits[0] : link.traits;
    if (!trait) continue;

    const choice_groups: BuilderTraitChoiceGroup[] = (groups ?? [])
      .filter((group) => group.trait_id === link.trait_id)
      .map((group) => ({
        trait_id: link.trait_id,
        trait_name: trait.name,
        option_group: group.option_group,
        choice_count: group.choice_count,
        is_required: group.is_required,
        notes: group.notes,
        options: (options ?? [])
          .filter(
            (opt) =>
              opt.trait_id === link.trait_id &&
              opt.option_group === group.option_group,
          )
          .map(
            (opt): BuilderTraitOption => ({
              trait_option_id: opt.id,
              name: opt.name,
              description: opt.description,
              option_group: opt.option_group,
            }),
          ),
      }));

    const entry: BuilderSpeciesTrait = {
      trait_id: link.trait_id,
      name: trait.name,
      description: trait.description,
      choice_groups,
    };

    const list = bySpecies.get(link.species_id) ?? [];
    list.push(entry);
    bySpecies.set(link.species_id, list);
  }

  return bySpecies;
}

async function fetchOriginFeatChoicesBatch(
  admin: ReturnType<typeof createAdminClient>,
  featIds: number[],
): Promise<Map<number, BuilderOriginFeatChoice[]>> {
  const uniqueIds = [...new Set(featIds.filter((id) => id > 0))];
  const result = new Map<number, BuilderOriginFeatChoice[]>();
  if (!uniqueIds.length) return result;

  const { data: featTraits, error } = await admin
    .from("feat_traits")
    .select("feat_id, trait_id, traits(id, name)")
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
    .select("id, trait_id, option_group, name, description, sort_order")
    .in("trait_id", traitIds)
    .order("sort_order");

  if (optionError) throw new ApiError(optionError.message, 400);

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
          option_group: group.option_group,
          choice_count: group.choice_count,
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
              }),
            ),
        } satisfies BuilderOriginFeatChoice;
      });

    result.set(featId, choices);
  }

  return result;
}

async function fetchOriginFeatChoices(
  admin: ReturnType<typeof createAdminClient>,
  featId: number | null,
): Promise<BuilderOriginFeatChoice[]> {
  if (!featId) return [];
  const batch = await fetchOriginFeatChoicesBatch(admin, [featId]);
  return batch.get(featId) ?? [];
}

async function fetchBackgrounds(
  admin: ReturnType<typeof createAdminClient>,
): Promise<BuilderBackgroundEntry[]> {
  const { data: rows, error } = await admin
    .from("v_background_details")
    .select("*")
    .order("name");

  if (error) throw new ApiError(error.message, 400);

  const { data: equipmentRows, error: equipmentError } = await admin
    .from("v_background_equipment_details")
    .select(
      "background_id, option_key, label, gp_amount, option_notes, item_name, quantity, item_notes, item_id",
    );

  if (equipmentError) throw new ApiError(equipmentError.message, 400);

  const equipmentByBackground = new Map<number, BuilderEquipmentOption[]>();

  for (const row of equipmentRows ?? []) {
    const list = equipmentByBackground.get(row.background_id) ?? [];
    let option = list.find((entry) => entry.option_key === row.option_key);
    if (!option) {
      option = {
        option_key: row.option_key,
        label: row.label,
        gp_amount: row.gp_amount,
        notes: row.option_notes,
        items: [],
      };
      list.push(option);
    }
    if (row.item_name) {
      option.items.push({
        item_id: row.item_id,
        item_name: row.item_name,
        quantity: row.quantity ?? 1,
        notes: row.item_notes,
      } satisfies BuilderEquipmentItem);
    }
    equipmentByBackground.set(row.background_id, list);
  }

  const featIds = (rows ?? [])
    .map((row) => row.origin_feat_id)
    .filter((id): id is number => typeof id === "number" && id > 0);
  const originFeatChoicesById = await fetchOriginFeatChoicesBatch(admin, featIds);

  const backgrounds: BuilderBackgroundEntry[] = [];

  for (const row of rows ?? []) {
    const origin_feat_choices = row.origin_feat_id
      ? (originFeatChoicesById.get(row.origin_feat_id) ?? [])
      : [];

    backgrounds.push({
      id: row.background_id,
      name: row.name,
      description: row.description,
      origin_feat_id: row.origin_feat_id,
      origin_feat_name: row.origin_feat_name,
      origin_feat_selection_key: row.origin_feat_selection_key,
      ability_options: parseAbilityOptions(row.ability_options),
      skill_proficiencies: parseSkillProficiencies(row.skill_proficiencies),
      tool_proficiency_options: parseBackgroundTools(row.tool_proficiency_options),
      equipment_options: equipmentByBackground.get(row.background_id) ?? [],
      origin_feat_choices,
    });
  }

  return backgrounds;
}

async function fetchClassById(
  admin: ReturnType<typeof createAdminClient>,
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

  const classProfs = proficiencies ?? [];

  const skill_choices: BuilderSkillChoiceGroup[] = (skillGroups ?? []).map(
    (group) => ({
      choice_group: group.choice_group,
      choice_count: group.choice_count,
      notes: group.notes,
      options: (skillOptions ?? [])
        .filter((opt) => opt.choice_group === group.choice_group)
        .map((opt) => {
          const skill = Array.isArray(opt.skills) ? opt.skills[0] : opt.skills;
          return {
            skill_id: opt.skill_id,
            name: skill?.name ?? "Perícia",
            base_attribute: skill?.base_attribute ?? "STR",
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    }),
  );

  const tool_choices: BuilderToolChoiceGroup[] = (toolOptions ?? []).reduce<
    BuilderToolChoiceGroup[]
  >((acc, row) => {
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

  return {
    id: cls.id,
    name: cls.name,
    hit_die: cls.hit_die,
    saving_throws: classProfs
      .filter((p) => p.proficiency_type === "save")
      .map((p) => p.name),
    weapons: classProfs
      .filter((p) => p.proficiency_type === "weapon")
      .map((p) => p.name),
    armor: classProfs
      .filter((p) => p.proficiency_type === "armor")
      .map((p) => p.name),
    skill_choices,
    tool_choices,
  };
}

async function fetchBackgroundById(
  admin: ReturnType<typeof createAdminClient>,
  backgroundId: number,
): Promise<BuilderBackgroundEntry | null> {
  const { data: row, error } = await admin
    .from("v_background_details")
    .select("*")
    .eq("background_id", backgroundId)
    .maybeSingle();

  if (error) throw new ApiError(error.message, 400);
  if (!row) return null;

  const { data: equipmentRows, error: equipmentError } = await admin
    .from("v_background_equipment_details")
    .select(
      "background_id, option_key, label, gp_amount, option_notes, item_name, quantity, item_notes, item_id",
    )
    .eq("background_id", backgroundId);

  if (equipmentError) throw new ApiError(equipmentError.message, 400);

  const equipment_options: BuilderEquipmentOption[] = [];
  for (const equipmentRow of equipmentRows ?? []) {
    let option = equipment_options.find(
      (entry) => entry.option_key === equipmentRow.option_key,
    );
    if (!option) {
      option = {
        option_key: equipmentRow.option_key,
        label: equipmentRow.label,
        gp_amount: equipmentRow.gp_amount,
        notes: equipmentRow.option_notes,
        items: [],
      };
      equipment_options.push(option);
    }
    if (equipmentRow.item_name) {
      option.items.push({
        item_id: equipmentRow.item_id,
        item_name: equipmentRow.item_name,
        quantity: equipmentRow.quantity ?? 1,
        notes: equipmentRow.item_notes,
      });
    }
  }

  const origin_feat_choices = row.origin_feat_id
    ? await fetchOriginFeatChoices(admin, row.origin_feat_id)
    : [];

  return {
    id: row.background_id,
    name: row.name,
    description: row.description,
    origin_feat_id: row.origin_feat_id,
    origin_feat_name: row.origin_feat_name,
    origin_feat_selection_key: row.origin_feat_selection_key,
    ability_options: parseAbilityOptions(row.ability_options),
    skill_proficiencies: parseSkillProficiencies(row.skill_proficiencies),
    tool_proficiency_options: parseBackgroundTools(row.tool_proficiency_options),
    equipment_options,
    origin_feat_choices,
  };
}

async function fetchSpeciesTraitsForSpecies(
  admin: ReturnType<typeof createAdminClient>,
  speciesId: number,
): Promise<BuilderSpeciesTrait[]> {
  const { data: links, error } = await admin
    .from("species_traits")
    .select("species_id, trait_id, traits(id, name, description)")
    .eq("species_id", speciesId);

  if (error) throw new ApiError(error.message, 400);
  if (!links?.length) return [];

  const traitIds = links.map((link) => link.trait_id);

  const { data: groups, error: groupError } = await admin
    .from("trait_option_groups")
    .select("trait_id, option_group, choice_count, is_required, notes")
    .in("trait_id", traitIds);

  if (groupError) throw new ApiError(groupError.message, 400);

  const { data: options, error: optionError } = await admin
    .from("trait_options")
    .select("id, trait_id, option_group, name, description, sort_order")
    .in("trait_id", traitIds)
    .order("sort_order");

  if (optionError) throw new ApiError(optionError.message, 400);

  return links.flatMap((link) => {
    const trait = Array.isArray(link.traits) ? link.traits[0] : link.traits;
    if (!trait) return [];

    const choice_groups: BuilderTraitChoiceGroup[] = (groups ?? [])
      .filter((group) => group.trait_id === link.trait_id)
      .map((group) => ({
        trait_id: link.trait_id,
        trait_name: trait.name,
        option_group: group.option_group,
        choice_count: group.choice_count,
        is_required: group.is_required,
        notes: group.notes,
        options: (options ?? [])
          .filter(
            (opt) =>
              opt.trait_id === link.trait_id &&
              opt.option_group === group.option_group,
          )
          .map(
            (opt): BuilderTraitOption => ({
              trait_option_id: opt.id,
              name: opt.name,
              description: opt.description,
              option_group: opt.option_group,
            }),
          ),
      }));

    return [
      {
        trait_id: link.trait_id,
        name: trait.name,
        description: trait.description,
        choice_groups,
      },
    ];
  });
}

async function fetchClassesSummary(admin: ReturnType<typeof createAdminClient>) {
  const { data: classes, error } = await admin
    .from("classes")
    .select("id, name, hit_die")
    .order("name");

  if (error) throw new ApiError(error.message, 400);

  const { data: proficiencies, error: profError } = await admin
    .from("v_class_proficiency_details")
    .select("class_id, proficiency_type, name")
    .eq("requires_choice", false);

  if (profError) throw new ApiError(profError.message, 400);

  return (classes ?? []).map((cls) => {
    const classProfs = (proficiencies ?? []).filter((p) => p.class_id === cls.id);
    return {
      id: cls.id,
      name: cls.name,
      hit_die: cls.hit_die,
      saving_throws: classProfs
        .filter((p) => p.proficiency_type === "save")
        .map((p) => p.name),
      weapons: classProfs
        .filter((p) => p.proficiency_type === "weapon")
        .map((p) => p.name),
      armor: classProfs
        .filter((p) => p.proficiency_type === "armor")
        .map((p) => p.name),
      skill_choices: [] as BuilderSkillChoiceGroup[],
      tool_choices: [] as BuilderToolChoiceGroup[],
    } satisfies BuilderClassEntry;
  });
}

async function fetchBackgroundsSummary(
  admin: ReturnType<typeof createAdminClient>,
): Promise<BuilderBackgroundSummaryEntry[]> {
  const { data: rows, error } = await admin
    .from("v_background_details")
    .select("background_id, name, description, origin_feat_name, ability_options")
    .order("name");

  if (error) throw new ApiError(error.message, 400);

  return (rows ?? []).map((row) => ({
    id: row.background_id,
    name: row.name,
    description: row.description,
    origin_feat_name: row.origin_feat_name,
    ability_options: parseAbilityOptions(row.ability_options),
  }));
}

async function fetchToolsByCategory(admin: ReturnType<typeof createAdminClient>) {
  const { data: tools, error } = await admin
    .from("tools")
    .select("id, name, category")
    .order("name");

  if (error) throw new ApiError(error.message, 400);

  const tools_by_category: Record<string, BuilderToolOption[]> = {};
  for (const tool of tools ?? []) {
    const category = tool.category ?? "Outros";
    const list = tools_by_category[category] ?? [];
    list.push({
      tool_id: tool.id,
      name: tool.name,
      category: tool.category,
    });
    tools_by_category[category] = list;
  }
  return tools_by_category;
}

export async function fetchCharacterBuilderSummary(): Promise<CharacterBuilderSummary> {
  const admin = createAdminClient();

  const [classes, speciesResult, backgrounds] = await Promise.all([
    fetchClassesSummary(admin),
    admin
      .from("species")
      .select("id, name, description, creature_type, size_options, base_speed")
      .order("name"),
    fetchBackgroundsSummary(admin),
  ]);

  if (speciesResult.error) {
    throw new ApiError(speciesResult.error.message, 400);
  }

  const species: BuilderSpeciesSummaryEntry[] = (speciesResult.data ?? []).map(
    (entry) => ({ ...entry }),
  );

  return {
    classes: classes.map(({ id, name, hit_die, saving_throws, weapons, armor }) => ({
      id,
      name,
      hit_die,
      saving_throws,
      weapons,
      armor,
    })),
    species,
    backgrounds,
  };
}

export type BuilderDetailsRequest = {
  class_id: number;
  species_id: number;
  background_id: number;
};

export async function fetchCharacterBuilderDetails(
  request: BuilderDetailsRequest,
): Promise<Pick<
  CharacterBuilderData,
  "classes" | "species" | "backgrounds" | "origin_feats" | "tools_by_category" | "skills" | "details_loaded"
>> {
  const admin = createAdminClient();

  const [
    cls,
    speciesResult,
    background,
    originFeatsResult,
    tools_by_category,
    skillsResult,
    speciesTraits,
  ] = await Promise.all([
    fetchClassById(admin, request.class_id),
    admin
      .from("species")
      .select("id, name, description, creature_type, size_options, base_speed")
      .eq("id", request.species_id)
      .maybeSingle(),
    fetchBackgroundById(admin, request.background_id),
    admin
      .from("feats")
      .select("id, name, description, is_repeatable")
      .eq("category", "Origin")
      .order("name"),
    fetchToolsByCategory(admin),
    admin.from("skills").select("id, name, base_attribute").order("name"),
    fetchSpeciesTraitsForSpecies(admin, request.species_id),
  ]);

  if (speciesResult.error) throw new ApiError(speciesResult.error.message, 400);
  if (originFeatsResult.error) {
    throw new ApiError(originFeatsResult.error.message, 400);
  }
  if (skillsResult.error) throw new ApiError(skillsResult.error.message, 400);

  const speciesRow = speciesResult.data;

  if (!cls || !background || !speciesRow) {
    throw new ApiError("Seleções inválidas para carregar detalhes.", 400);
  }

  const species: BuilderSpeciesEntry = {
    ...speciesRow,
    traits: speciesTraits,
  };

  return {
    classes: [cls],
    species: [species],
    backgrounds: [background],
    origin_feats: (originFeatsResult.data ?? []) as BuilderOriginFeat[],
    tools_by_category,
    skills: (skillsResult.data ?? []).map((skill) => ({
      skill_id: skill.id,
      name: skill.name,
      base_attribute: skill.base_attribute,
    })),
    details_loaded: true,
  };
}

export async function fetchCharacterBuilderDataForState(
  request: BuilderDetailsRequest,
): Promise<CharacterBuilderData> {
  const [summary, details] = await Promise.all([
    fetchCharacterBuilderSummary(),
    fetchCharacterBuilderDetails(request),
  ]);
  return mergeBuilderData(summary, details);
}

export async function fetchCharacterBuilderData(): Promise<CharacterBuilderData> {
  const summary = await fetchCharacterBuilderSummary();
  return mergeBuilderData(summary, null);
}
