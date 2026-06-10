import { ApiError } from "@/lib/api/errors";
import { unwrap } from "@/lib/character/server/utils";
import type { CharacterAdminClient } from "@/lib/character/server/types";
import type { CharacterFeatSummary } from "@/shared/character";

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

export async function fetchCharacterFeats(
  admin: CharacterAdminClient,
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
