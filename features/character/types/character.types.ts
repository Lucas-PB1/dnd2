export type CharacterClassSummary = {
  name: string;
  level: number;
};

export type CharacterSummary = {
  id: number;
  name: string;
  level: number;
  species_name: string | null;
  background_name: string | null;
  classes: CharacterClassSummary[];
  updated_at: string;
};

export type CharacterDetail = CharacterSummary & {
  is_owner: boolean;
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
