import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/api/errors";
import {
  CHARACTER_LIST_SELECT,
  mapCharacterRow,
  type CharacterListRow,
} from "@/lib/character/map-row";
import type {
  CharacterDetail,
  CharacterResourceSummary,
  CharacterSpellcastingInfo,
  CharacterSpellSlot,
  CharacterSummary,
  CharacterTraitSummary,
} from "@/features/character-sheet/types/character.types";

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

function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

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

  const [spell_slots, spellcasting, traits, resources] = await Promise.all([
    fetchCharacterSpellSlots(admin, characterId),
    fetchPrimarySpellcasting(admin, characterId),
    fetchCharacterTraits(admin, characterId),
    fetchCharacterResources(admin, characterId),
  ]);

  return {
    ...mapCharacterRow(data as CharacterListRow),
    is_owner: true,
    spell_slots,
    spellcasting,
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
