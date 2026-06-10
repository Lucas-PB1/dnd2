import { ApiError } from "@/lib/api/errors";
import { unwrap } from "@/lib/character/server/utils";
import type { CharacterAdminClient } from "@/lib/character/server/types";
import type {
  CharacterSpellcastingInfo,
  CharacterSpellSlot,
} from "@/shared/character";

type SpellcastingProgressionRef =
  | {
      progression_type: CharacterSpellcastingInfo["progression_type"];
      slot_recovery: string;
    }
  | {
      progression_type: CharacterSpellcastingInfo["progression_type"];
      slot_recovery: string;
    }[]
  | null;

type SpellcastingRef =
  | {
      spellcasting_ability: string | null;
      spellcasting_progressions: SpellcastingProgressionRef;
    }
  | {
      spellcasting_ability: string | null;
      spellcasting_progressions: SpellcastingProgressionRef;
    }[]
  | null;

type SpellcastingMetaRow = {
  class_level: number;
  classes:
    | { name: string; class_spellcasting: SpellcastingRef }
    | { name: string; class_spellcasting: SpellcastingRef }[]
    | null;
};

type SpellSlotRow = {
  slot_level: number;
  max_slots: number;
  used_slots: number;
};

export async function fetchCharacterSpellSlots(
  admin: CharacterAdminClient,
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

export async function fetchPrimarySpellcasting(
  admin: CharacterAdminClient,
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

export function resolveSpellSlots(
  adminSlots: CharacterSpellSlot[],
  rollContextSlots: CharacterSpellSlot[],
  hasAuth: boolean,
): CharacterSpellSlot[] {
  if (hasAuth && rollContextSlots.length > 0) return rollContextSlots;
  return adminSlots;
}
