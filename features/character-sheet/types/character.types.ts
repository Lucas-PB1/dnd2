export type CharacterClassSummary = {
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
  spell_slots: CharacterSpellSlot[];
  spellcasting: CharacterSpellcastingInfo | null;
  traits: CharacterTraitSummary[];
  resources: CharacterResourceSummary[];
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
