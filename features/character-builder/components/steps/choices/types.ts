import type {
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

export type FeatModalState = {
  title: string;
  content: "origin" | "trait";
  traitOption?: import("@/features/character-builder/types/builder.types").BuilderTraitOption;
  featId?: number;
} | null;
