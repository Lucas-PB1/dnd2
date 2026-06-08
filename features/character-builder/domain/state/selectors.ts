import type {
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";

export function selectedClass(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
) {
  return data.classes.find((entry) => entry.id === state.class_id) ?? null;
}

export function selectedSpecies(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
) {
  return data.species.find((entry) => entry.id === state.species_id) ?? null;
}

export function selectedBackground(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
) {
  return (
    data.backgrounds.find((entry) => entry.id === state.background_id) ?? null
  );
}
