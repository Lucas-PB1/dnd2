import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/api/errors";
import { passivePerception } from "@/shared/character/rules";
import {
  CHARACTER_LIST_SELECT,
  mapCharacterRow,
  type CharacterListRow,
} from "@/lib/character/map-row";
import { mergeSkillCatalog } from "@/lib/character/map-sheet";
import { fetchCharacterFeats } from "@/lib/character/server/feats";
import { fetchCharacterKnownSpells } from "@/lib/character/server/known-spells";
import {
  fetchPrimarySpellcasting,
  fetchCharacterSpellSlots,
  resolveSpellSlots,
} from "@/lib/character/server/spellcasting";
import {
  fetchCharacterRollContext,
  fetchCharacterSheetRpc,
} from "@/lib/character/server/sheet-rpcs";
import { fetchSkillCatalog } from "@/lib/character/server/skill-catalog";
import type { AuthenticatedSheetClient } from "@/lib/character/server/types";
import type { CharacterDetail, CharacterSummary } from "@/shared/character";

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
    spell_slots: resolveSpellSlots(
      adminSpellSlots,
      rollContext.spell_slots,
      authClient != null,
    ),
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
