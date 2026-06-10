import type { CharacterAbilityKey } from "@/shared/character/base";

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
