import { ApiError } from "@/lib/api/errors";
import type { BuilderProgressionFeat } from "@/features/character-builder/types/builder.types";
import {
  fetchFeatSpellcasting,
  fetchOriginFeatChoicesBatch,
} from "./fetch-origin-feats";
import type { BuilderAdminClient } from "./types";

export async function fetchProgressionFeatsEnriched(
  admin: BuilderAdminClient,
): Promise<BuilderProgressionFeat[]> {
  const { data: feats, error } = await admin
    .from("feats")
    .select("id, name, description, category, prerequisite_text, is_repeatable")
    .in("category", ["General", "Epic Boon"])
    .order("name");

  if (error) throw new ApiError(error.message, 400);

  const featIds = (feats ?? []).map((feat) => feat.id);
  const choicesById = await fetchOriginFeatChoicesBatch(admin, featIds);
  const spellcastingById = new Map<
    number,
    Awaited<ReturnType<typeof fetchFeatSpellcasting>>
  >();

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
