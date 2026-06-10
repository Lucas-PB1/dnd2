import type {
  AbilityKey,
  CreateCharacterBuilderPayload,
} from "@/features/character-builder/types/builder.types";

export function toCreateCharacterRpcBody(
  payload: CreateCharacterBuilderPayload & {
    _skillsPayload?: { skill_id: number; is_proficient: boolean; has_expertise: boolean }[];
  },
) {
  const abilities: Record<AbilityKey, number> = payload.abilities;

  return {
    name: payload.name,
    species_id: payload.species_id,
    background_id: payload.background_id,
    size: payload.size,
    max_hp: payload.max_hp,
    current_hp: payload.max_hp,
    starting_gold_gp: payload.starting_gold_gp ?? 0,
    abilities: {
      STR: abilities.STR,
      DEX: abilities.DEX,
      CON: abilities.CON,
      INT: abilities.INT,
      WIS: abilities.WIS,
      CHA: abilities.CHA,
    },
    classes: payload.classes,
    skills: payload._skillsPayload ?? payload.class_skill_ids.map((skill_id) => ({
      skill_id,
      is_proficient: true,
    })),
    proficiencies: payload.proficiencies.map((prof) => ({
      proficiency_type: "tool",
      tool_id: prof.tool_id,
      name: prof.name,
      source_type: prof.source_type,
      source_id: prof.source_id,
    })),
    trait_options: payload.trait_options.map((opt) => ({
      trait_id: opt.trait_id,
      option_group: opt.option_group,
      selection_key: opt.selection_key,
      trait_option_id: opt.trait_option_id,
      source_type: "player",
    })),
    feats: payload.feats.map((feat) => ({
      feat_id: feat.feat_id,
      source_type: feat.source_type,
      source_id: feat.source_id,
      selection_key: feat.selection_key ?? null,
    })),
    inventory: payload.inventory,
    spells: payload.spells,
    trait_spell_choices: payload.trait_spell_choices.map((entry) => ({
      trait_id: entry.trait_id,
      choice_group: entry.choice_group,
      selection_key: entry.selection_key,
      spell_level: entry.spell_level,
      spell_id: entry.spell_id,
      trait_option_id: entry.trait_option_id ?? null,
      spell_list_id: entry.spell_list_id ?? null,
      source_type: entry.source_type,
      source_id: entry.source_id,
    })),
  };
}
