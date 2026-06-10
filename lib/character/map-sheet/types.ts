import type {
  CharacterAbilityScore,
  CharacterActiveEffect,
  CharacterInventoryItem,
  CharacterProficiency,
  CharacterResourceSummary,
  CharacterSavingThrow,
  CharacterSheetSummary,
  CharacterSkillCheck,
  CharacterSpellcastingBlock,
  CharacterSpellSlot,
  CharacterStatModifier,
  CharacterTraitOptionSummary,
  CharacterTraitSpellChoice,
  CharacterTraitSummary,
  CharacterWeaponAttack,
} from "@/shared/character";

export type SkillCatalogRow = {
  name: string;
  base_attribute: string;
};

export type SheetRpcData = {
  summary: CharacterSheetSummary | null;
  inventory: CharacterInventoryItem[];
  traits: CharacterTraitSummary[];
  proficiencies: CharacterProficiency[];
  active_effects: CharacterActiveEffect[];
  stat_modifiers: CharacterStatModifier[];
  trait_options: CharacterTraitOptionSummary[];
  trait_spell_choices: CharacterTraitSpellChoice[];
};

export type RollContextData = {
  abilities: CharacterAbilityScore[];
  saving_throws: CharacterSavingThrow[];
  skills: CharacterSkillCheck[];
  spellcasting_entries: CharacterSpellcastingBlock[];
  weapons: CharacterWeaponAttack[];
  spell_slots: CharacterSpellSlot[];
  resources: CharacterResourceSummary[];
};
