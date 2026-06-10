export type CharacterClassSummary = {
  class_id: number;
  name: string;
  level: number;
};

export type CharacterSpellSlot = {
  slot_level: number;
  max_slots: number;
  used_slots: number;
};

export type CharacterSpellcastingInfo = {
  class_name: string;
  progression_type: "full" | "half" | "pact" | "third";
  slot_recovery: string;
  spellcasting_ability: string | null;
};

export type CharacterAbilityKey = "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";

export type CharacterSheetSummary = {
  size: string | null;
  speed: number;
  current_hp: number;
  max_hp: number;
  effective_max_hp: number;
  temporary_hp: number;
  death_save_successes: number;
  death_save_failures: number;
  heroic_inspiration: boolean;
  armor_class: number;
  effective_armor_class: number;
  effective_speed: number;
  feats: string | null;
  conditions: string | null;
};

export type CharacterAbilityScore = {
  ability: CharacterAbilityKey;
  label: string;
  score: number;
  modifier: number;
};

export type CharacterSavingThrow = {
  ability: CharacterAbilityKey;
  label: string;
  modifier: number;
  proficient: boolean;
};

export type CharacterSkillCheck = {
  skill: string;
  base_attribute: CharacterAbilityKey;
  modifier: number;
  proficient: boolean;
  expertise: boolean;
};

export type CharacterSpellcastingBlock = {
  class_id: number;
  class_name: string;
  class_level: number;
  spellcasting_ability: CharacterAbilityKey | null;
  prepared_count: number | null;
  spell_attack_bonus: number | null;
  spell_save_dc: number | null;
};

export type CharacterWeaponAttack = {
  item_id: number;
  name: string;
  is_equipped: boolean;
  attack_ability: CharacterAbilityKey | null;
  attack_ability_options: CharacterAbilityKey[];
  proficient: boolean;
  attack_bonus: number | null;
  damage_formula: string | null;
  damage_type: string | null;
  properties: string | null;
  mastery_name: string | null;
};

export type CharacterInventoryItem = {
  item_id: number;
  name: string;
  quantity: number;
  is_equipped: boolean;
  item_type: "Weapon" | "Armor" | "Item" | string;
  cost_gp: number | null;
  weight_lb: number | null;
  is_magical: boolean;
  weapon_category: string | null;
  damage_die: string | null;
  die_count: number | null;
  flat_bonus: number | null;
  damage_type: string | null;
  mastery_name: string | null;
  weapon_properties: string | null;
  armor_category: string | null;
  ac_bonus: number | null;
  min_strength: number | null;
  stealth_disadvantage: boolean | null;
  plus_dex_modifier: boolean | null;
  max_dex_bonus: number | null;
  is_attuned: boolean;
  requires_attunement: boolean;
  is_consumable: boolean;
};

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

export type CharacterSummary = {
  id: number;
  name: string;
  level: number;
  proficiency_bonus: number;
  species_name: string | null;
  background_name: string | null;
  starting_gold_gp: number;
  classes: CharacterClassSummary[];
  updated_at: string;
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

export type CharacterDetail = CharacterSummary & {
  is_owner: boolean;
  sheet_summary: CharacterSheetSummary | null;
  abilities: CharacterAbilityScore[];
  saving_throws: CharacterSavingThrow[];
  skills: CharacterSkillCheck[];
  passive_perception: number | null;
  spell_slots: CharacterSpellSlot[];
  spellcasting: CharacterSpellcastingInfo | null;
  spellcasting_entries: CharacterSpellcastingBlock[];
  weapons: CharacterWeaponAttack[];
  inventory: CharacterInventoryItem[];
  proficiencies: CharacterProficiency[];
  known_spells: CharacterKnownSpell[];
  trait_options: CharacterTraitOptionSummary[];
  trait_spell_choices: CharacterTraitSpellChoice[];
  active_effects: CharacterActiveEffect[];
  stat_modifiers: CharacterStatModifier[];
  traits: CharacterTraitSummary[];
  resources: CharacterResourceSummary[];
  character_feats: CharacterFeatSummary[];
};

export type CreateCharacterPayload = {
  name: string;
  species_id: number;
  background_id: number;
  class_id: number;
};

export type CreateCharacterResponse = {
  character_id: number;
  level: number;
};

export type CharacterCatalog = {
  species: CatalogSpecies[];
  backgrounds: CatalogBackground[];
  classes: CatalogClass[];
};

export type CatalogSpecies = {
  id: number;
  name: string;
  description: string | null;
  creature_type: string;
  size_options: string;
  base_speed: number;
};

export type CatalogBackground = {
  id: number;
  name: string;
  description: string | null;
};

export type CatalogClass = {
  id: number;
  name: string;
};

export type CharacterListResponse = {
  characters: CharacterSummary[];
};

export const CHARACTER_NAME_MIN = 2;
export const CHARACTER_NAME_MAX = 255;
