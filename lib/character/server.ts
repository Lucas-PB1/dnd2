import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/api/errors";
import {
  CHARACTER_LIST_SELECT,
  mapCharacterRow,
  type CharacterListRow,
} from "@/lib/character/map-row";
import type { CharacterSummary } from "@/features/character/types/character.types";

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
): Promise<CharacterSummary | null> {
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

  return data ? mapCharacterRow(data as CharacterListRow) : null;
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
