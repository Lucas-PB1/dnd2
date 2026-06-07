export const ABILITY_KEYS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
export type AbilityKey = (typeof ABILITY_KEYS)[number];

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;

export type AbilityMethod = "standard" | "point_buy" | "roll";

export type BackgroundAsiMode = "split" | "even";

export type BuilderSkillOption = {
  skill_id: number;
  name: string;
  base_attribute: string;
};

export type BuilderToolOption = {
  tool_id: number | null;
  name: string;
  category: string | null;
};

export type BuilderTraitOption = {
  trait_option_id: number;
  name: string;
  description: string | null;
  option_group: string;
};

export type BuilderTraitChoiceGroup = {
  trait_id: number;
  trait_name: string;
  option_group: string;
  choice_count: number;
  is_required: boolean;
  notes: string | null;
  options: BuilderTraitOption[];
};

export type BuilderSpeciesTrait = {
  trait_id: number;
  name: string;
  description: string | null;
  choice_groups: BuilderTraitChoiceGroup[];
};

export type BuilderSkillChoiceGroup = {
  choice_group: string;
  choice_count: number;
  notes: string | null;
  options: BuilderSkillOption[];
};

export type BuilderToolChoiceGroup = {
  option_group: string;
  choice_count: number;
  notes: string | null;
  tool_category: string | null;
  options: BuilderToolOption[];
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

export type BuilderBackgroundToolOption = {
  id: number;
  option_group: string;
  choice_count: number;
  name: string;
  tool_id: number | null;
  tool_category: string | null;
  notes: string | null;
};

export type BuilderEquipmentItem = {
  item_id: number | null;
  item_name: string;
  quantity: number;
  notes: string | null;
};

export type BuilderEquipmentOption = {
  option_key: string;
  label: string | null;
  gp_amount: number | null;
  notes: string | null;
  items: BuilderEquipmentItem[];
};

export type BuilderOriginFeatChoice = {
  trait_id: number;
  trait_name: string;
  option_group: string;
  choice_count: number;
  options: BuilderTraitOption[];
};

export type BuilderBackgroundEntry = {
  id: number;
  name: string;
  description: string | null;
  origin_feat_id: number | null;
  origin_feat_name: string | null;
  origin_feat_selection_key: string | null;
  ability_options: AbilityKey[];
  skill_proficiencies: BuilderSkillOption[];
  tool_proficiency_options: BuilderBackgroundToolOption[];
  equipment_options: BuilderEquipmentOption[];
  origin_feat_choices: BuilderOriginFeatChoice[];
};

export type BuilderOriginFeat = {
  id: number;
  name: string;
  description: string | null;
  is_repeatable: boolean;
};

export type CharacterBuilderSummary = {
  classes: BuilderClassSummaryEntry[];
  species: BuilderSpeciesSummaryEntry[];
  backgrounds: BuilderBackgroundSummaryEntry[];
};

export type BuilderClassSummaryEntry = {
  id: number;
  name: string;
  hit_die: string;
  saving_throws: string[];
  weapons: string[];
  armor: string[];
};

export type BuilderSpeciesSummaryEntry = {
  id: number;
  name: string;
  description: string | null;
  creature_type: string;
  size_options: string;
  base_speed: number;
};

export type BuilderBackgroundSummaryEntry = {
  id: number;
  name: string;
  description: string | null;
  origin_feat_name: string | null;
  ability_options: AbilityKey[];
};

export type CharacterBuilderData = {
  classes: BuilderClassEntry[];
  species: BuilderSpeciesEntry[];
  backgrounds: BuilderBackgroundEntry[];
  origin_feats: BuilderOriginFeat[];
  tools_by_category: Record<string, BuilderToolOption[]>;
  skills: BuilderSkillOption[];
  details_loaded: boolean;
};

export type AbilityAssignment = Record<AbilityKey, number | null>;

export type BackgroundAsiSelection = {
  mode: BackgroundAsiMode;
  plus2: AbilityKey | null;
  plus1: AbilityKey | null;
};

export type TraitOptionSelection = {
  trait_id: number;
  option_group: string;
  selection_key: string;
  trait_option_id: number;
};

export type SkillSelection = {
  skill_id: number;
};

export type ToolProficiencySelection = {
  tool_id: number;
  name: string;
  source_type: string;
  source_id: number;
};

export type CharacterBuilderState = {
  step: number;
  ability_method: AbilityMethod;
  ability_assignment: AbilityAssignment;
  roll_sets: number[][];
  selected_roll_index: number | null;
  species_id: number | null;
  background_id: number | null;
  background_asi: BackgroundAsiSelection;
  class_id: number | null;
  class_skill_ids: number[];
  class_tool_selections: ToolProficiencySelection[];
  background_tool_selections: ToolProficiencySelection[];
  species_trait_options: TraitOptionSelection[];
  origin_feat_trait_options: TraitOptionSelection[];
  human_origin_feat_id: number | null;
  equipment_option_key: string | null;
  size: string | null;
  name: string;
};

export type CreateCharacterBuilderPayload = {
  name: string;
  class_id: number;
  species_id: number;
  background_id: number;
  size?: string;
  abilities: Record<AbilityKey, number>;
  max_hp?: number;
  class_skill_ids: number[];
  proficiencies: ToolProficiencySelection[];
  trait_options: TraitOptionSelection[];
  feats: { feat_id: number; source_type: string; source_id: number; selection_key?: string }[];
  inventory: { item_id: number; quantity: number; is_equipped?: boolean }[];
};

export const BUILDER_STEPS = [
  { id: "abilities", title: "Atributos", subtitle: "Método e valores base" },
  { id: "origin", title: "Origem", subtitle: "Espécie, antecedente e bônus" },
  { id: "class", title: "Classe", subtitle: "Nível 1" },
  { id: "choices", title: "Escolhas", subtitle: "Perícias, traços e equipamento" },
  { id: "details", title: "Detalhes", subtitle: "Nome e revisão" },
] as const;
