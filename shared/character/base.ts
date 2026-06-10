export type CharacterAbilityKey = "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";

export type CharacterClassSummary = {
  class_id: number;
  name: string;
  level: number;
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

export type CharacterListResponse = {
  characters: CharacterSummary[];
};

export const CHARACTER_NAME_MIN = 2;
export const CHARACTER_NAME_MAX = 255;
