import type {
  AbilityKey,
  AbilityMethod,
  BackgroundAsiMode,
} from "@/features/character-builder/types/abilities";
import type { EquipmentMode, ShopPurchase } from "@/features/character-builder/types/shop";
import type {
  FeatSpellSelection,
  ProgressionFeatSlotChoice,
} from "@/features/character-builder/types/feats";

export type AbilityAssignment = Record<AbilityKey, number | null>;
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
  class_level: number;
  subclass_id: number | null;
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
  equipment_mode: EquipmentMode;
  equipment_option_key: string | null;
  shop_purchases: ShopPurchase[];
  cantrip_spell_ids: number[];
  feat_spell_selections: FeatSpellSelection[];
  spellbook_spell_ids: number[];
  prepared_spell_ids: number[];
  expertise_by_trait: Record<string, number[]>;
  class_trait_option_selections: TraitOptionSelection[];
  progression_feat_slots: ProgressionFeatSlotChoice[];
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
