import type {
  BuilderSpellOption,
  BuilderTraitOption,
} from "@/features/character-builder/types/options";

export type ProgressionFeatLevel = 4 | 8 | 12 | 16 | 19;

export type ProgressionFeatChoiceKind = "asi" | "feat";

export type ProgressionFeatSlotChoice = {
  at_level: ProgressionFeatLevel;
  kind: ProgressionFeatChoiceKind | null;
  feat_id: number | null;
};

export type BuilderOriginFeatChoice = {
  trait_id: number;
  trait_name: string;
  trait_description: string | null;
  option_group: string;
  choice_count: number;
  is_required?: boolean;
  options: BuilderTraitOption[];
};

export type BuilderFeatSpellGroup = {
  trait_id: number;
  choice_group: string;
  choice_count: number;
  spell_level: number;
  always_prepared: boolean;
  notes: string | null;
};

export type BuilderFeatSpellcasting = {
  feat_id: number;
  feat_name: string;
  trait_id: number;
  trait_name: string;
  spell_list_option_group: string;
  groups: BuilderFeatSpellGroup[];
  spells_by_list: Record<string, BuilderSpellOption[]>;
  spell_list_ids_by_name: Record<string, number>;
};

export type BuilderProgressionFeat = {
  id: number;
  name: string;
  description: string | null;
  category: string;
  prerequisite_text: string | null;
  is_repeatable: boolean;
  origin_feat_choices: BuilderOriginFeatChoice[];
  spellcasting: BuilderFeatSpellcasting | null;
};

export type BuilderOriginFeat = {
  id: number;
  name: string;
  description: string | null;
  is_repeatable: boolean;
  origin_feat_choices: BuilderOriginFeatChoice[];
  spellcasting: BuilderFeatSpellcasting | null;
};

export type FeatSpellSource = "background" | "human" | "progression";

export type FeatSpellSelection = {
  source: FeatSpellSource;
  trait_id: number;
  choice_group: string;
  selection_key: string;
  spell_level: number;
  spell_id: number;
};
