import type {
  BuilderSpellOption,
  BuilderTraitOption,
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";

export type ChoiceTab = "skills" | "spells" | "traits" | "feats" | "gear";

export type ChoiceTabItem = {
  id: ChoiceTab;
  label: string;
  badge?: string;
};

export type ChoicesTabProps = {
  data: CharacterBuilderData;
  state: CharacterBuilderState;
  onChange: (next: CharacterBuilderState) => void;
};

export type ChoiceModalState = {
  title: string;
  content: "origin" | "trait" | "spell";
  traitOption?: BuilderTraitOption;
  spell?: BuilderSpellOption;
  featId?: number;
} | null;

/** @deprecated Use ChoiceModalState */
export type FeatModalState = ChoiceModalState;
