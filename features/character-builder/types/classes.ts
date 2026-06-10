import type {
  BuilderSkillChoiceGroup,
  BuilderSkillOption,
  BuilderSpellOption,
  BuilderToolChoiceGroup,
  BuilderTraitOption,
} from "@/features/character-builder/types/options";

export type BuilderClassSpellcasting = {
  spellcasting_ability: string | null;
  cantrip_count: number;
  prepared_count: number;
  spellbook_count: number;
  uses_spellbook: boolean;
  max_spell_level: number;
  spells: BuilderSpellOption[];
  prepared_spell_pool?: BuilderSpellOption[];
  uses_magical_secrets?: boolean;
};

export type BuilderExpertiseGroup = {
  trait_id: number;
  level_required: number;
  trait_name: string;
  choice_count: number;
  pool: "proficient" | "class_skills" | "fixed";
  fixed_skills: BuilderSkillOption[];
  notes: string | null;
};

export type BuilderOptionalFeatureGroup = {
  group_key: string;
  trait_id: number;
  trait_name: string;
  trait_description: string | null;
  option_group: string;
  choice_count: number;
  level_required: number;
  tab_label: string;
  notes: string | null;
  options: BuilderTraitOption[];
};

export type BuilderClassFeature = {
  trait_id: number;
  name: string;
  description: string | null;
  level_required: number;
};

export type BuilderSubclassSummary = {
  id: number;
  name: string;
  description: string | null;
  unlock_level: number;
  features: BuilderClassFeature[];
};

export type BuilderClassEntry = {
  id: number;
  name: string;
  hit_die: string;
  saving_throws: string[];
  weapons: string[];
  armor: string[];
  skill_choices: BuilderSkillChoiceGroup[];
  tool_choices: BuilderToolChoiceGroup[];
  spellcasting: BuilderClassSpellcasting | null;
  expertise_choices: BuilderExpertiseGroup[];
  optional_feature_groups: BuilderOptionalFeatureGroup[];
  features: BuilderClassFeature[];
  subclasses: BuilderSubclassSummary[];
};

export type BuilderClassSummaryEntry = {
  id: number;
  name: string;
  hit_die: string;
  saving_throws: string[];
  weapons: string[];
  armor: string[];
  skill_choices?: BuilderSkillChoiceGroup[];
  spellcasting?: BuilderClassSpellcasting | null;
  expertise_choices?: BuilderExpertiseGroup[];
  features?: BuilderClassFeature[];
  subclasses?: BuilderSubclassSummary[];
};
