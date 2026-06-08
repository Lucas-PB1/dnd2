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
  skill_id?: number | null;
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

export type BuilderSpellOption = {
  spell_id: number;
  name: string;
  level: number;
  school: string | null;
  requires_concentration: boolean;
  requires_ritual: boolean;
};

export type BuilderClassSpellcasting = {
  spellcasting_ability: string | null;
  cantrip_count: number;
  prepared_count: number;
  spellbook_count: number;
  uses_spellbook: boolean;
  spells: BuilderSpellOption[];
};

export type BuilderExpertiseGroup = {
  trait_id: number;
  trait_name: string;
  choice_count: number;
  pool: "proficient" | "class_skills" | "fixed";
  fixed_skills: BuilderSkillOption[];
  notes: string | null;
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

export type FeatSpellSource = "background" | "human";

export type FeatSpellSelection = {
  source: FeatSpellSource;
  trait_id: number;
  choice_group: string;
  selection_key: string;
  spell_level: number;
  spell_id: number;
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
  origin_feat_spellcasting: BuilderFeatSpellcasting | null;
};

export type BuilderOriginFeat = {
  id: number;
  name: string;
  description: string | null;
  is_repeatable: boolean;
  origin_feat_choices: BuilderOriginFeatChoice[];
  spellcasting: BuilderFeatSpellcasting | null;
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
  spellcasting?: BuilderClassSpellcasting | null;
  expertise_choices?: BuilderExpertiseGroup[];
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

/** Índice do dado rolado atribuído a cada atributo (somente método roll). */
export type RollSlotAssignment = Record<AbilityKey, number | null>;

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
  roll_slot_assignment: RollSlotAssignment;
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
  human_origin_feat_trait_options: TraitOptionSelection[];
  equipment_option_key: string | null;
  cantrip_spell_ids: number[];
  feat_spell_selections: FeatSpellSelection[];
  spellbook_spell_ids: number[];
  prepared_spell_ids: number[];
  /** trait_id → skill_ids com expertise */
  expertise_by_trait: Record<number, number[]>;
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
  spells: {
    spell_id: number;
    source_type: string;
    is_prepared: boolean;
    always_prepared?: boolean;
  }[];
  trait_spell_choices: {
    trait_id: number;
    choice_group: string;
    selection_key: string;
    spell_level: number;
    spell_id: number;
    trait_option_id?: number;
    spell_list_id?: number;
    source_type: string;
    source_id: number;
  }[];
};

export const BUILDER_STEPS = [
  { id: "abilities", title: "Atributos", subtitle: "Método e valores base" },
  { id: "species", title: "Espécie", subtitle: "Raça e tamanho" },
  { id: "background", title: "Antecedente", subtitle: "História e bônus" },
  { id: "class", title: "Classe", subtitle: "Nível 1" },
  { id: "choices", title: "Escolhas", subtitle: "Perícias, traços e equipamento" },
  { id: "details", title: "Detalhes", subtitle: "Nome e revisão" },
] as const;
