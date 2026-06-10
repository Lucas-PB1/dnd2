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
  CharacterFeatSummary,
  CharacterKnownSpell,
  CharacterSpellcastingInfo,
  CharacterSpellSlot,
  CharacterSummary,
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

type CharacterFeatRow = {
  feat_id: number;
  source_type: string;
  source_id: number | null;
  selection_key: string | null;
  notes: string | null;
  feats:
    | { name: string; category: string | null }
    | { name: string; category: string | null }[]
    | null;
};

type AuthenticatedSheetClient = Pick<SupabaseClient, "rpc">;

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

async function fetchCharacterFeats(
  admin: ReturnType<typeof createAdminClient>,
  characterId: number,
): Promise<CharacterFeatSummary[]> {
  const { data, error } = await admin
    .from("character_feats")
    .select(
      `
      feat_id,
      source_type,
      source_id,
      selection_key,
      notes,
      feats ( name, category )
    `,
    )
    .eq("character_id", characterId)
    .order("source_type")
    .order("selection_key", { ascending: true, nullsFirst: true });

  if (error) {
    throw new ApiError(error.message, 400);
  }

  return ((data ?? []) as CharacterFeatRow[]).flatMap((row) => {
    const feat = unwrap(row.feats);
    if (!feat) return [];
    return [{
      feat_id: row.feat_id,
      name: feat.name,
      category: feat.category,
      source_type: row.source_type,
      source_id: row.source_id,
      selection_key: row.selection_key,
      notes: row.notes,
    }];
  });
}

function resolveSpellSlots(
  adminSlots: CharacterSpellSlot[],
  rollContextSlots: CharacterSpellSlot[],
  hasAuth: boolean,
): CharacterSpellSlot[] {
  if (hasAuth && rollContextSlots.length > 0) {
    return rollContextSlots;
  }
  return adminSlots;
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
    adminSpellSlots,
    spellcasting,
    skillCatalog,
    known_spells,
    character_feats,
    sheet,
    rollContext,
  ] = await Promise.all([
    fetchCharacterSpellSlots(admin, characterId),
    fetchPrimarySpellcasting(admin, characterId),
    fetchSkillCatalog(admin),
    fetchCharacterKnownSpells(admin, characterId),
    fetchCharacterFeats(admin, characterId),
    fetchCharacterSheetRpc(authClient, characterId),
    fetchCharacterRollContext(authClient, characterId),
  ]);
  const spell_slots = resolveSpellSlots(
    adminSpellSlots,
    rollContext.spell_slots,
    authClient != null,
  );
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
    proficiencies: sheet.proficiencies,
    known_spells,
    trait_options: sheet.trait_options,
    trait_spell_choices: sheet.trait_spell_choices,
    active_effects: sheet.active_effects,
    stat_modifiers: sheet.stat_modifiers,
    traits: sheet.traits,
    resources: rollContext.resources,
    character_feats,
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
