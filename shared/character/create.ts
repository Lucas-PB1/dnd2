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
