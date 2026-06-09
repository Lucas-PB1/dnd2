import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/api/errors";
import { passivePerception } from "@/features/character-sheet/domain/sheet-display";
import {
  CHARACTER_LIST_SELECT,
  mapCharacterRow,
  type CharacterListRow,
} from "@/lib/character/map-row";
import {
  emptyRollContextData,
  emptySheetRpcData,
  mapRollContextResponse,
  mapSheetRpcResponse,
  mergeSkillCatalog,
  type RollContextData,
  type SheetRpcData,
  type SkillCatalogRow,
} from "@/lib/character/map-sheet";
import type {
  CharacterAbilityKey,
  CharacterDetail,
  CharacterKnownSpell,
  CharacterProficiency,
  CharacterResourceSummary,
  CharacterSpellcastingInfo,
  CharacterSpellSlot,
  CharacterSummary,
  CharacterTraitSummary,
} from "@/features/character-sheet/types/character.types";
import type { SupabaseClient } from "@supabase/supabase-js";

function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function asAbilityKey(value: unknown): CharacterAbilityKey | null {
  if (
    value === "STR" ||
    value === "DEX" ||
    value === "CON" ||
    value === "INT" ||
    value === "WIS" ||
    value === "CHA"
  ) {
    return value;
  }
  return null;
}

type SpellcastingMetaRow = {
  class_level: number;
  classes:
    | {
        name: string;
        class_spellcasting:
          | {
              spellcasting_ability: string | null;
              spellcasting_progressions:
                | {
                    progression_type: CharacterSpellcastingInfo["progression_type"];
                    slot_recovery: string;
                  }
                | {
                    progression_type: CharacterSpellcastingInfo["progression_type"];
                    slot_recovery: string;
                  }[]
                | null;
            }
          | {
              spellcasting_ability: string | null;
              spellcasting_progressions:
                | {
                    progression_type: CharacterSpellcastingInfo["progression_type"];
                    slot_recovery: string;
                  }
                | {
                    progression_type: CharacterSpellcastingInfo["progression_type"];
                    slot_recovery: string;
                  }[]
                | null;
            }[]
          | null;
      }
    | {
        name: string;
        class_spellcasting:
          | {
              spellcasting_ability: string | null;
              spellcasting_progressions:
                | {
                    progression_type: CharacterSpellcastingInfo["progression_type"];
                    slot_recovery: string;
                  }
                | {
                    progression_type: CharacterSpellcastingInfo["progression_type"];
                    slot_recovery: string;
                  }[]
                | null;
            }
          | {
              spellcasting_ability: string | null;
              spellcasting_progressions:
                | {
                    progression_type: CharacterSpellcastingInfo["progression_type"];
                    slot_recovery: string;
                  }
                | {
                    progression_type: CharacterSpellcastingInfo["progression_type"];
                    slot_recovery: string;
                  }[]
                | null;
            }[]
          | null;
      }[]
    | null;
};

type SpellSlotRow = {
  slot_level: number;
  max_slots: number;
  used_slots: number;
};

type CharacterTraitRow = {
  trait_id: number;
  trait_name: string;
  source_type: string;
  source_name: string;
  level_required: number | null;
};

type CharacterResourceRow = {
  trait_id: number | null;
  resource_key: string | null;
  name: string;
  max_uses: number;
  used_uses: number;
  reset_on: string | null;
};

type AuthenticatedSheetClient = Pick<SupabaseClient, "rpc">;

type ProficiencyRow = {
  proficiency_type: string;
  tool_id: number | null;
  name: string;
  source_type: string | null;
  source_id: number | null;
  tools:
    | {
        category: string | null;
        base_attribute: string | null;
      }
    | {
        category: string | null;
        base_attribute: string | null;
      }[]
    | null;
};

type CharacterSpellRow = {
  source_type: string | null;
  is_prepared: boolean | null;
  always_prepared: boolean | null;
  spells:
    | {
        id: number;
        name: string;
        level: number;
        school: string | null;
        casting_time: string | null;
        range_text: string | null;
        components: string | null;
        material_component: string | null;
        duration_text: string | null;
        requires_concentration: boolean | null;
        requires_ritual: boolean | null;
        save_attribute: string | null;
        attack_type: string | null;
      }
    | {
        id: number;
        name: string;
        level: number;
        school: string | null;
        casting_time: string | null;
        range_text: string | null;
        components: string | null;
        material_component: string | null;
        duration_text: string | null;
        requires_concentration: boolean | null;
        requires_ritual: boolean | null;
        save_attribute: string | null;
        attack_type: string | null;
      }[]
    | null;
};

async function fetchCharacterSpellSlots(
  admin: ReturnType<typeof createAdminClient>,
  characterId: number,
): Promise<CharacterSpellSlot[]> {
  const { data, error } = await admin
    .from("character_spell_slots")
    .select("slot_level, max_slots, used_slots")
    .eq("character_id", characterId)
    .order("slot_level");

  if (error) {
    throw new ApiError(error.message, 400);
  }

  return ((data ?? []) as SpellSlotRow[]).map((row) => ({
    slot_level: row.slot_level,
    max_slots: row.max_slots,
    used_slots: row.used_slots,
  }));
}

async function fetchPrimarySpellcasting(
  admin: ReturnType<typeof createAdminClient>,
  characterId: number,
): Promise<CharacterSpellcastingInfo | null> {
  const { data, error } = await admin
    .from("character_classes")
    .select(
      `
      class_level,
      classes (
        name,
        class_spellcasting (
          spellcasting_ability,
          spellcasting_progressions ( progression_type, slot_recovery )
        )
      )
    `,
    )
    .eq("character_id", characterId)
    .order("class_level", { ascending: false });

  if (error) {
    throw new ApiError(error.message, 400);
  }

  for (const row of (data ?? []) as SpellcastingMetaRow[]) {
    const cls = unwrap(row.classes);
    const spellcasting = unwrap(cls?.class_spellcasting ?? null);
    if (!cls || !spellcasting) continue;

    const progression = unwrap(spellcasting.spellcasting_progressions);
    if (!progression) continue;

    return {
      class_name: cls.name,
      progression_type: progression.progression_type,
      slot_recovery: progression.slot_recovery,
      spellcasting_ability: spellcasting.spellcasting_ability,
    };
  }

  return null;
}

async function fetchCharacterTraits(
  admin: ReturnType<typeof createAdminClient>,
  characterId: number,
): Promise<CharacterTraitSummary[]> {
  const { data, error } = await admin
    .from("v_character_traits")
    .select("trait_id, trait_name, source_type, source_name, level_required")
    .eq("character_id", characterId)
    .order("source_type")
    .order("level_required", { ascending: true, nullsFirst: true })
    .order("trait_name");

  if (error) {
    throw new ApiError(error.message, 400);
  }

  return ((data ?? []) as CharacterTraitRow[]).map((row) => ({
    trait_id: row.trait_id,
    trait_name: row.trait_name,
    source_type: row.source_type,
    source_name: row.source_name,
    level_required: row.level_required,
  }));
}

async function fetchCharacterResources(
  admin: ReturnType<typeof createAdminClient>,
  characterId: number,
): Promise<CharacterResourceSummary[]> {
  const { data, error } = await admin
    .from("character_resources")
    .select("trait_id, resource_key, name, max_uses, used_uses, reset_on")
    .eq("character_id", characterId)
    .order("name");

  if (error) {
    throw new ApiError(error.message, 400);
  }

  return ((data ?? []) as CharacterResourceRow[]).map((row) => ({
    trait_id: row.trait_id,
    resource_key: row.resource_key,
    name: row.name,
    max_uses: row.max_uses,
    used_uses: row.used_uses,
    reset_on: row.reset_on,
  }));
}

async function fetchSkillCatalog(
  admin: ReturnType<typeof createAdminClient>,
): Promise<SkillCatalogRow[]> {
  const { data, error } = await admin
    .from("skills")
    .select("name, base_attribute")
    .order("name");

  if (error) {
    throw new ApiError(error.message, 400);
  }

  return (data ?? []) as SkillCatalogRow[];
}

async function fetchCharacterProficiencies(
  admin: ReturnType<typeof createAdminClient>,
  characterId: number,
): Promise<CharacterProficiency[]> {
  const { data, error } = await admin
    .from("character_proficiencies")
    .select(
      `
      proficiency_type,
      tool_id,
      name,
      source_type,
      source_id,
      tools ( category, base_attribute )
    `,
    )
    .eq("character_id", characterId)
    .order("proficiency_type")
    .order("name");

  if (error) {
    throw new ApiError(error.message, 400);
  }

  return ((data ?? []) as ProficiencyRow[]).map((row) => {
    const tool = unwrap(row.tools);
    return {
      proficiency_type: row.proficiency_type,
      name: row.name,
      tool_id: row.tool_id,
      tool_category: tool?.category ?? null,
      tool_base_attribute: asAbilityKey(tool?.base_attribute),
      source_type: row.source_type,
      source_id: row.source_id,
    };
  });
}

async function fetchCharacterKnownSpells(
  admin: ReturnType<typeof createAdminClient>,
  characterId: number,
): Promise<CharacterKnownSpell[]> {
  const { data, error } = await admin
    .from("character_spells")
    .select(
      `
      source_type,
      is_prepared,
      always_prepared,
      spells (
        id,
        name,
        level,
        school,
        casting_time,
        range_text,
        components,
        material_component,
        duration_text,
        requires_concentration,
        requires_ritual,
        save_attribute,
        attack_type
      )
    `,
    )
    .eq("character_id", characterId)
    .order("source_type");

  if (error) {
    throw new ApiError(error.message, 400);
  }

  return ((data ?? []) as CharacterSpellRow[]).flatMap((row) => {
    const spell = unwrap(row.spells);
    if (!spell) return [];
    return [{
      spell_id: spell.id,
      name: spell.name,
      level: spell.level,
      school: spell.school,
      casting_time: spell.casting_time,
      range_text: spell.range_text,
      components: spell.components,
      material_component: spell.material_component,
      duration_text: spell.duration_text,
      requires_concentration: spell.requires_concentration ?? false,
      requires_ritual: spell.requires_ritual ?? false,
      save_attribute: asAbilityKey(spell.save_attribute),
      attack_type: spell.attack_type,
      source_type: row.source_type,
      is_prepared: row.is_prepared ?? false,
      always_prepared: row.always_prepared ?? false,
    }];
  });
}

async function fetchCharacterSheetRpc(
  client: AuthenticatedSheetClient | undefined,
  characterId: number,
): Promise<SheetRpcData> {
  if (!client) return emptySheetRpcData();

  const { data, error } = await client.rpc("get_character_sheet", {
    p_character_id: characterId,
  });

  if (error) {
    throw new ApiError(error.message, 400);
  }

  return mapSheetRpcResponse(data);
}

async function fetchCharacterRollContext(
  client: AuthenticatedSheetClient | undefined,
  characterId: number,
): Promise<RollContextData> {
  if (!client) return emptyRollContextData();

  const { data, error } = await client.rpc("get_character_roll_context", {
    p_character_id: characterId,
  });

  if (error) {
    throw new ApiError(error.message, 400);
  }

  return mapRollContextResponse(data);
}

export async function listCharactersForUser(
  userId: string,
): Promise<CharacterSummary[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("characters")
    .select(CHARACTER_LIST_SELECT)
    .eq("owner_player_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new ApiError(error.message, 400);
  }

  return ((data ?? []) as CharacterListRow[]).map(mapCharacterRow);
}

export async function getCharacterForUser(
  characterId: number,
  userId: string,
  authClient?: AuthenticatedSheetClient,
): Promise<CharacterDetail | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("characters")
    .select(CHARACTER_LIST_SELECT)
    .eq("id", characterId)
    .eq("owner_player_id", userId)
    .maybeSingle();

  if (error) {
    throw new ApiError(error.message, 400);
  }

  if (!data) return null;

  const [
    spell_slots,
    spellcasting,
    traits,
    resources,
    skillCatalog,
    proficiencies,
    known_spells,
    sheet,
    rollContext,
  ] = await Promise.all([
    fetchCharacterSpellSlots(admin, characterId),
    fetchPrimarySpellcasting(admin, characterId),
    fetchCharacterTraits(admin, characterId),
    fetchCharacterResources(admin, characterId),
    fetchSkillCatalog(admin),
    fetchCharacterProficiencies(admin, characterId),
    fetchCharacterKnownSpells(admin, characterId),
    fetchCharacterSheetRpc(authClient, characterId),
    fetchCharacterRollContext(authClient, characterId),
  ]);
  const skills = mergeSkillCatalog(
    skillCatalog,
    rollContext.skills,
    rollContext.abilities,
  );

  return {
    ...mapCharacterRow(data as CharacterListRow),
    is_owner: true,
    sheet_summary: sheet.summary,
    abilities: rollContext.abilities,
    saving_throws: rollContext.saving_throws,
    skills,
    passive_perception: passivePerception(skills),
    spell_slots,
    spellcasting,
    spellcasting_entries: rollContext.spellcasting_entries,
    weapons: rollContext.weapons,
    inventory: sheet.inventory,
    proficiencies,
    known_spells,
    trait_options: sheet.trait_options,
    trait_spell_choices: sheet.trait_spell_choices,
    active_effects: sheet.active_effects,
    stat_modifiers: sheet.stat_modifiers,
    traits,
    resources,
  };
}

export async function deleteCharacterForUser(
  characterId: number,
  userId: string,
): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("characters")
    .delete()
    .eq("id", characterId)
    .eq("owner_player_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new ApiError(error.message, 400);
  }

  return data !== null;
}
