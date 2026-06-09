export const ABILITY_KEYS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
export type AbilityKey = (typeof ABILITY_KEYS)[number];

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;

export type AbilityMethod = "standard" | "point_buy" | "roll";

export type BackgroundAsiMode = "split" | "even";

export type EquipmentMode = "background" | "starting_gold" | "campaign_shop";

export type ShopPurchase = {
  item_id: number;
  item_name: string;
  quantity: number;
  unit_price_gp: number;
  is_magical: boolean;
};

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

export type BuilderTraitOptionModifier = {
  choice_mode_key: string | null;
  affected_stat: string | null;
  operation: string;
  modifier_value: number;
  max_value: number | null;
};

export type BuilderTraitOption = {
  trait_option_id: number;
  name: string;
  description: string | null;
  option_group: string;
  skill_id?: number | null;
  modifiers?: BuilderTraitOptionModifier[];
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
  description: string | null;
  casting_time?: string | null;
  range_text?: string | null;
  components?: string | null;
  material_component?: string | null;
  duration_text?: string | null;
  save_attribute?: string | null;
  attack_type?: string | null;
  character_effect_summary?: string | null;
};

export type BuilderClassSpellcasting = {
  spellcasting_ability: string | null;
  cantrip_count: number;
  prepared_count: number;
  spellbook_count: number;
  uses_spellbook: boolean;
  /** Maior nível de magia selecionável (slots de classe). */
  max_spell_level: number;
  spells: BuilderSpellOption[];
  /** Pool expandido de preparadas (Magical Secrets @ 10). */
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

export type ProgressionFeatLevel = 4 | 8 | 12 | 16 | 19;

export type ProgressionFeatChoiceKind = "asi" | "feat";

export type ProgressionFeatSlotChoice = {
  at_level: ProgressionFeatLevel;
  kind: ProgressionFeatChoiceKind | null;
  feat_id: number | null;
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

export type FeatSpellSource = "background" | "human" | "progression";

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
  origin_feat_description: string | null;
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
  skill_choices?: BuilderSkillChoiceGroup[];
  spellcasting?: BuilderClassSpellcasting | null;
  expertise_choices?: BuilderExpertiseGroup[];
  features?: BuilderClassFeature[];
  subclasses?: BuilderSubclassSummary[];
};

export type BuilderSpeciesSummaryEntry = {
  id: number;
  name: string;
  description: string | null;
  creature_type: string;
  size_options: string;
  base_speed: number;
  traits: BuilderSpeciesTrait[];
};

export type BuilderBackgroundSummaryEntry = {
  id: number;
  name: string;
  description: string | null;
  origin_feat_id: number | null;
  origin_feat_name: string | null;
  origin_feat_description: string | null;
  ability_options: AbilityKey[];
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
  option_group?: string;
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
  /** Nível da classe principal (1–20). */
  class_level: number;
  subclass_id: number | null;
  /** Multiclasse opcional (segunda entrada em classes[]). */
  secondary_class: {
    class_id: number;
    class_level: number;
    subclass_id: number | null;
  } | null;
  class_skill_ids: number[];
  class_tool_selections: ToolProficiencySelection[];
  background_tool_selections: ToolProficiencySelection[];
  species_trait_options: TraitOptionSelection[];
  origin_feat_trait_options: TraitOptionSelection[];
  human_origin_feat_id: number | null;
  human_origin_feat_trait_options: TraitOptionSelection[];
  /** Nível 1: sempre background. Nível 2+: pacote, ouro PHB ou loja de campanha. */
  equipment_mode: EquipmentMode;
  equipment_option_key: string | null;
  /** Compras na loja (modo campaign_shop). */
  shop_purchases: ShopPurchase[];
  cantrip_spell_ids: number[];
  feat_spell_selections: FeatSpellSelection[];
  spellbook_spell_ids: number[];
  prepared_spell_ids: number[];
  /** trait_id:level_required → skill_ids com expertise */
  expertise_by_trait: Record<string, number[]>;
  /** Escolhas de traços opcionais de classe/subclasse (Fighting Style, manobras…). */
  class_trait_option_selections: TraitOptionSelection[];
  /** Feats de progressão nos níveis 4/8/12/16/19. */
  progression_feat_slots: ProgressionFeatSlotChoice[];
  /** Escolhas internas dos feats de progressão (ASI, perícias do feat…). */
  progression_feat_trait_options: TraitOptionSelection[];
  size: string | null;
  name: string;
};

export type CreateCharacterBuilderPayload = {
  name: string;
  class_id: number;
  class_level: number;
  subclass_id: number | null;
  classes: {
    class_id: number;
    class_level: number;
    subclass_id: number | null;
  }[];
  species_id: number;
  background_id: number;
  size?: string;
  abilities: Record<AbilityKey, number>;
  max_hp?: number;
  starting_gold_gp?: number;
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
  { id: "class", title: "Classe", subtitle: "Classe e nível inicial" },
  { id: "choices", title: "Escolhas", subtitle: "Perícias, magias e equipamento" },
  { id: "feats", title: "Talentos", subtitle: "Feats de origem e progressão" },
  { id: "details", title: "Detalhes", subtitle: "Nome e revisão" },
] as const;
