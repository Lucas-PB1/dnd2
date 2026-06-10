import type { BuilderTraitChoiceGroup } from "@/features/character-builder/types/options";

export type BuilderSpeciesTrait = {
  trait_id: number;
  name: string;
  description: string | null;
  choice_groups: BuilderTraitChoiceGroup[];
};

export type BuilderSpeciesEntry = {
  id: number;
  name: string;
  description: string | null;
  creature_type: string;
  size_options: string;
  base_speed: number;
  traits: BuilderSpeciesTrait[];
};

export type BuilderSpeciesSummaryEntry = BuilderSpeciesEntry;
