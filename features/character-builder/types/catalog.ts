import type {
  BuilderBackgroundEntry,
  BuilderBackgroundSummaryEntry,
} from "@/features/character-builder/types/backgrounds";
import type {
  BuilderClassEntry,
  BuilderClassSummaryEntry,
} from "@/features/character-builder/types/classes";
import type {
  BuilderOriginFeat,
  BuilderProgressionFeat,
} from "@/features/character-builder/types/feats";
import type { BuilderToolOption, BuilderSkillOption } from "@/features/character-builder/types/options";
import type {
  BuilderSpeciesEntry,
  BuilderSpeciesSummaryEntry,
} from "@/features/character-builder/types/species";

export type CharacterBuilderSummary = {
  classes: BuilderClassSummaryEntry[];
  species: BuilderSpeciesSummaryEntry[];
  backgrounds: BuilderBackgroundSummaryEntry[];
};

export type CharacterBuilderData = {
  classes: BuilderClassEntry[];
  species: BuilderSpeciesEntry[];
  backgrounds: BuilderBackgroundEntry[];
  origin_feats: BuilderOriginFeat[];
  progression_feats: BuilderProgressionFeat[];
  tools_by_category: Record<string, BuilderToolOption[]>;
  skills: BuilderSkillOption[];
  details_loaded: boolean;
};
