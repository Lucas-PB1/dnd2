import type {
  CharacterAbilityScore,
  CharacterSavingThrow,
  CharacterSkillCheck,
  CharacterSummary,
} from "@/shared/character/base";
import type {
  CharacterInventoryItem,
  CharacterSpellcastingBlock,
  CharacterSpellcastingInfo,
  CharacterSpellSlot,
  CharacterWeaponAttack,
} from "@/shared/character/combat";
import type {
  CharacterActiveEffect,
  CharacterFeatSummary,
  CharacterKnownSpell,
  CharacterProficiency,
  CharacterResourceSummary,
  CharacterStatModifier,
  CharacterTraitOptionSummary,
  CharacterTraitSpellChoice,
  CharacterTraitSummary,
} from "@/shared/character/features";

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
