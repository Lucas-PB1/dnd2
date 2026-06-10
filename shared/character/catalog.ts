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
