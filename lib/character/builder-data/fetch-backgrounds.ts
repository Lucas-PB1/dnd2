import { ApiError } from "@/lib/api/errors";
import type {
  BuilderBackgroundEntry,
  BuilderBackgroundSummaryEntry,
} from "@/features/character/types/builder.types";
import type { BuilderAdminClient } from "./types";
import { buildEquipmentOptionsFromRows } from "./fetch-equipment";
import {
  fetchFeatSpellcasting,
  fetchOriginFeatChoices,
} from "./fetch-origin-feats";
import {
  parseAbilityOptions,
  parseBackgroundTools,
  parseSkillProficiencies,
} from "./parsers";

export async function fetchBackgroundById(
  admin: BuilderAdminClient,
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

  const [origin_feat_choices, origin_feat_spellcasting] = row.origin_feat_id
    ? await Promise.all([
        fetchOriginFeatChoices(admin, row.origin_feat_id),
        fetchFeatSpellcasting(admin, row.origin_feat_id, row.origin_feat_name),
      ])
    : [[], null];

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
    equipment_options: buildEquipmentOptionsFromRows(equipmentRows ?? []),
    origin_feat_choices,
    origin_feat_spellcasting,
  };
}

export async function fetchBackgroundsSummary(
  admin: BuilderAdminClient,
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
