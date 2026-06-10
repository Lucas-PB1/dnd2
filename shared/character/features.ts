import type { CharacterAbilityKey } from "@/shared/character/base";

export type CharacterProficiency = {
  proficiency_type: "save" | "tool" | "language" | "weapon" | "armor" | "other" | string;
  name: string;
  tool_id: number | null;
  tool_category: string | null;
  tool_base_attribute: CharacterAbilityKey | null;
  source_type: string | null;
  source_id: number | null;
};

export type CharacterKnownSpell = {
  spell_id: number;
  name: string;
  level: number;
  school: string | null;
  casting_time: string | null;
  range_text: string | null;
  components: string | null;
  material_component: string | null;
  duration_text: string | null;
  requires_concentration: boolean;
  requires_ritual: boolean;
  save_attribute: CharacterAbilityKey | null;
  attack_type: string | null;
  source_type: string | null;
  is_prepared: boolean;
  always_prepared: boolean;
};

export type CharacterTraitOptionSummary = {
  trait_id: number;
  trait_name: string;
  option_group: string;
  choice_count: number;
  is_required: boolean;
  selection_key: string;
  trait_option_id: number;
  option_name: string;
  option_description: string | null;
  option_skill_name: string | null;
  option_tool_name: string | null;
  option_spell_list_name: string | null;
  source_type: string | null;
  source_id: number | null;
  notes: string | null;
};

export type CharacterTraitSpellChoice = {
  trait_id: number;
  trait_name: string;
  choice_group: string;
  choice_count: number;
  spell_level: number | null;
  always_prepared: boolean;
  free_casts_per: string | null;
  selection_key: string;
  spell_id: number;
  spell_name: string;
  level: number;
  school: string | null;
  trait_option_name: string | null;
  spell_list_name: string | null;
  source_type: string | null;
  source_id: number | null;
  notes: string | null;
};

export type CharacterActiveEffect = {
  source_type: string;
  source_name: string;
  trait_name: string | null;
  effect_name: string;
  is_active: boolean;
  duration_text: string | null;
  modifiers: unknown[];
  damage_adjustments: unknown[];
  statuses: unknown[];
  condition_adjustments: unknown[];
  proficiencies: unknown[];
};

export type CharacterStatModifier = {
  affected_stat: string;
  operation: string;
  modifier_value: number;
  source_name: string;
  is_active: boolean;
};

export type CharacterTraitSummary = {
  trait_id: number;
  trait_name: string;
  source_type: string;
  source_name: string;
  level_required: number | null;
};

export type CharacterFeatSummary = {
  feat_id: number;
  name: string;
  category: string | null;
  source_type: string;
  source_id: number | null;
  selection_key: string | null;
  notes: string | null;
};

export type CharacterResourceSummary = {
  trait_id: number | null;
  resource_key: string | null;
  name: string;
  max_uses: number;
  used_uses: number;
  reset_on: string | null;
};
