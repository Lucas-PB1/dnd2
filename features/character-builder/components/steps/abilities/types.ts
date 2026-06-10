import type { CharacterBuilderState } from "@/features/character-builder/types/builder.types";

export type AbilityStepProps = {
  state: CharacterBuilderState;
  onChange: (next: CharacterBuilderState) => void;
};
