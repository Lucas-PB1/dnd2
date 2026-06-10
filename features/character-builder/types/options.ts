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
