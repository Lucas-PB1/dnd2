import type {
  CharacterActiveEffect,
  CharacterProficiency,
  CharacterResourceSummary,
  CharacterStatModifier,
  CharacterTraitOptionSummary,
  CharacterTraitSpellChoice,
  CharacterTraitSummary,
} from "@/shared/character";
import {
  asAbilityKey,
  asArray,
  asBoolean,
  asNumber,
  asOptionalNumber,
  asString,
  isRecord,
} from "@/lib/character/map-sheet/guards";

export function mapTraitSummary(value: unknown): CharacterTraitSummary | null {
  if (!isRecord(value)) return null;

  return {
    trait_id: asNumber(value.trait_id),
    trait_name: asString(value.trait_name) ?? "Traço",
    source_type: asString(value.source_type) ?? "trait",
    source_name: asString(value.source_name) ?? "Fonte",
    level_required: asOptionalNumber(value.level_required),
  };
}

export function mapProficiency(value: unknown): CharacterProficiency | null {
  if (!isRecord(value)) return null;

  return {
    proficiency_type: asString(value.proficiency_type) ?? "other",
    name: asString(value.name) ?? "Proficiência",
    tool_id: asOptionalNumber(value.tool_id),
    tool_category: asString(value.tool_category),
    tool_base_attribute: asAbilityKey(value.tool_base_attribute),
    source_type: asString(value.source_type),
    source_id: asOptionalNumber(value.source_id),
  };
}

export function mapResource(value: unknown): CharacterResourceSummary | null {
  if (!isRecord(value)) return null;

  return {
    trait_id: asOptionalNumber(value.trait_id),
    resource_key: asString(value.resource_key),
    name: asString(value.name) ?? "Recurso",
    max_uses: asNumber(value.max_uses),
    used_uses: asNumber(value.used_uses),
    reset_on: asString(value.reset_on),
  };
}

export function mapTraitOption(value: unknown): CharacterTraitOptionSummary | null {
  if (!isRecord(value)) return null;

  return {
    trait_id: asNumber(value.trait_id),
    trait_name: asString(value.trait_name) ?? "Traço",
    option_group: asString(value.option_group) ?? "default",
    choice_count: asNumber(value.choice_count, 1),
    is_required: asBoolean(value.is_required, true),
    selection_key: asString(value.selection_key) ?? "",
    trait_option_id: asNumber(value.trait_option_id),
    option_name: asString(value.option_name) ?? "Escolha",
    option_description: asString(value.option_description),
    option_skill_name: asString(value.option_skill_name),
    option_tool_name: asString(value.option_tool_name),
    option_spell_list_name: asString(value.option_spell_list_name),
    source_type: asString(value.source_type),
    source_id: asOptionalNumber(value.source_id),
    notes: asString(value.notes),
  };
}

export function mapTraitSpellChoice(value: unknown): CharacterTraitSpellChoice | null {
  if (!isRecord(value)) return null;

  return {
    trait_id: asNumber(value.trait_id),
    trait_name: asString(value.trait_name) ?? "Traço",
    choice_group: asString(value.choice_group) ?? "spell",
    choice_count: asNumber(value.choice_count, 1),
    spell_level: asOptionalNumber(value.spell_level),
    always_prepared: asBoolean(value.always_prepared),
    free_casts_per: asString(value.free_casts_per),
    selection_key: asString(value.selection_key) ?? "",
    spell_id: asNumber(value.spell_id),
    spell_name: asString(value.spell_name) ?? "Magia",
    level: asNumber(value.level),
    school: asString(value.school),
    trait_option_name: asString(value.trait_option_name),
    spell_list_name: asString(value.spell_list_name),
    source_type: asString(value.source_type),
    source_id: asOptionalNumber(value.source_id),
    notes: asString(value.notes),
  };
}

export function mapActiveEffect(value: unknown): CharacterActiveEffect | null {
  if (!isRecord(value)) return null;

  return {
    source_type: asString(value.source_type) ?? "effect",
    source_name: asString(value.source_name) ?? "Efeito",
    trait_name: asString(value.trait_name),
    effect_name: asString(value.effect_name) ?? "Efeito",
    is_active: asBoolean(value.is_active, true),
    duration_text: asString(value.duration_text),
    modifiers: asArray(value.modifiers),
    damage_adjustments: asArray(value.damage_adjustments),
    statuses: asArray(value.statuses),
    condition_adjustments: asArray(value.condition_adjustments),
    proficiencies: asArray(value.proficiencies),
  };
}

export function mapStatModifier(value: unknown): CharacterStatModifier | null {
  if (!isRecord(value)) return null;

  return {
    affected_stat: asString(value.affected_stat) ?? "stat",
    operation: asString(value.operation) ?? "add",
    modifier_value: asNumber(value.modifier_value),
    source_name: asString(value.source_name) ?? "Modificador",
    is_active: asBoolean(value.is_active, true),
  };
}
