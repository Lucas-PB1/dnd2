import { ApiError } from "@/lib/api/errors";
import { asAbilityKey, unwrap } from "@/lib/character/server/utils";
import type { CharacterAdminClient } from "@/lib/character/server/types";
import type { CharacterKnownSpell } from "@/shared/character";

type SpellRow = {
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
};

type CharacterSpellRow = {
  source_type: string | null;
  is_prepared: boolean | null;
  always_prepared: boolean | null;
  spells: SpellRow | SpellRow[] | null;
};

export async function fetchCharacterKnownSpells(
  admin: CharacterAdminClient,
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
