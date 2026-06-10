import type { AbilityKey } from "@/features/character-builder/types/abilities";
import type {
  BuilderFeatSpellcasting,
  BuilderOriginFeatChoice,
} from "@/features/character-builder/types/feats";
import type { BuilderSkillOption } from "@/features/character-builder/types/options";

export type BuilderBackgroundToolOption = {
  id: number;
  option_group: string;
  choice_count: number;
  name: string;
  tool_id: number | null;
  tool_category: string | null;
  notes: string | null;
};

export type BuilderEquipmentItem = {
  item_id: number | null;
  item_name: string;
  quantity: number;
  notes: string | null;
};

export type BuilderEquipmentOption = {
  option_key: string;
  label: string | null;
  gp_amount: number | null;
  notes: string | null;
  items: BuilderEquipmentItem[];
};

export type BuilderBackgroundEntry = {
  id: number;
  name: string;
  description: string | null;
  origin_feat_id: number | null;
  origin_feat_name: string | null;
  origin_feat_description: string | null;
  origin_feat_selection_key: string | null;
  ability_options: AbilityKey[];
  skill_proficiencies: BuilderSkillOption[];
  tool_proficiency_options: BuilderBackgroundToolOption[];
  equipment_options: BuilderEquipmentOption[];
  origin_feat_choices: BuilderOriginFeatChoice[];
  origin_feat_spellcasting: BuilderFeatSpellcasting | null;
};

export type BuilderBackgroundSummaryEntry = {
  id: number;
  name: string;
  description: string | null;
  origin_feat_id: number | null;
  origin_feat_name: string | null;
  origin_feat_description: string | null;
  ability_options: AbilityKey[];
};
