import { ApiError } from "@/lib/api/errors";
import {
  applyBackgroundAsi,
  abilityModifier,
  isBaseAbilitiesComplete,
} from "@/features/character-builder/domain/abilities/abilities";
import { computeMaxHp } from "@/features/character-builder/domain/progression/hp";
import { requiresSubclass } from "@/features/character-builder/domain/progression/levels";
import {
  buildProgressionFeatsPayload,
  validateProgressionFeatSelections,
} from "@/features/character-builder/domain/progression/feats";
import { validateOptionalFeatureSelections } from "@/features/character-builder/domain/optional-features";
import type {
  AbilityKey,
  CharacterBuilderData,
  CharacterBuilderState,
  CreateCharacterBuilderPayload,
  TraitOptionSelection,
} from "@/features/character-builder/types/builder.types";
import { ABILITY_KEYS } from "@/features/character-builder/types/builder.types";
import { CHARACTER_NAME_MIN } from "@/features/character-sheet/types/character.types";
import {
  buildSkillsPayloadWithExpertise,
  validateExpertiseSelections,
} from "@/features/character-builder/domain/expertise/class-expertise";
import {
  buildSpellsRpcPayload,
  classRequiresSpellSelection,
  validateSpellSelections,
} from "@/features/character-builder/domain/spells/class-spells";
import {
  buildFeatSpellsRpcPayload,
  validateFeatSpellSelections,
} from "@/features/character-builder/domain/spells/feat-spells";
import { mergeOriginFeatTraitOptions } from "@/features/character-builder/domain/origin-feat";

export function buildRpcPayloadFromBuilderState(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
): CreateCharacterBuilderPayload {
  const cls = data.classes.find((entry) => entry.id === state.class_id);
  const species = data.species.find((entry) => entry.id === state.species_id);
  const background = data.backgrounds.find(
    (entry) => entry.id === state.background_id,
  );

  if (!cls || !species || !background) {
    throw new ApiError("Seleções incompletas.", 400);
  }

  if (requiresSubclass(state.class_level)) {
    if (!state.subclass_id) {
      throw new ApiError("Escolha uma subclasse.", 400);
    }
    if (!cls.subclasses.some((sub) => sub.id === state.subclass_id)) {
      throw new ApiError("Subclasse inválida para esta classe.", 400);
    }
  } else if (state.subclass_id !== null) {
    throw new ApiError("Subclasse só é permitida a partir do nível 3.", 400);
  }

  const name = state.name.trim();
  if (name.length < CHARACTER_NAME_MIN) {
    throw new ApiError(
      `O nome deve ter pelo menos ${CHARACTER_NAME_MIN} caracteres.`,
      400,
    );
  }

  const selectedRollSet =
    state.selected_roll_index !== null
      ? (state.roll_sets[state.selected_roll_index] ?? null)
      : null;

  if (
    !isBaseAbilitiesComplete(
      state.ability_method,
      state.ability_assignment,
      selectedRollSet,
    )
  ) {
    throw new ApiError("Atributos base incompletos ou inválidos.", 400);
  }

  const abilities = applyBackgroundAsi(
    state.ability_assignment,
    background.ability_options,
    state.background_asi,
  );

  const requiredClassSkills = cls.skill_choices.reduce(
    (sum, group) => sum + group.choice_count,
    0,
  );
  if (state.class_skill_ids.length !== requiredClassSkills) {
    throw new ApiError("Selecione todas as perícias de classe.", 400);
  }

  for (const trait of species.traits) {
    for (const group of trait.choice_groups) {
      if (!group.is_required) continue;
      const selected = state.species_trait_options.filter(
        (opt) =>
          opt.trait_id === group.trait_id &&
          opt.option_group === group.option_group,
      );
      if (selected.length !== group.choice_count) {
        throw new ApiError(
          `Complete as escolhas de espécie: ${trait.name} (${group.option_group}).`,
          400,
        );
      }
    }
  }

  if (species.name === "Human" && !state.human_origin_feat_id) {
    throw new ApiError("Humanos devem escolher um feat de origem (Versátil).", 400);
  }

  if (!state.equipment_option_key) {
    throw new ApiError("Escolha o equipamento inicial do antecedente.", 400);
  }

  const sizes = species.size_options.split(/\s+or\s+/i).map((s) => s.trim());
  const size =
    state.size ??
    (sizes.length === 1 ? sizes[0] : null);
  if (!size) {
    throw new ApiError("Escolha o tamanho do personagem.", 400);
  }

  const trait_options: TraitOptionSelection[] = [...state.species_trait_options];

  const originFeatOptions = mergeOriginFeatTraitOptions(
    background,
    state.origin_feat_trait_options,
  );

  for (const group of background.origin_feat_choices) {
    const selected = originFeatOptions.filter(
      (opt) =>
        opt.trait_id === group.trait_id &&
        opt.option_group === group.option_group,
    );
    if (selected.length !== group.choice_count) {
      throw new ApiError(
        `Complete as escolhas do feat de origem: ${group.trait_name}.`,
        400,
      );
    }
    trait_options.push(
      ...selected.map((entry) => ({
        ...entry,
        selection_key:
          background.origin_feat_selection_key ?? entry.selection_key,
      })),
    );
  }

  if (state.human_origin_feat_id) {
    const humanFeat = data.origin_feats.find(
      (entry) => entry.id === state.human_origin_feat_id,
    );
    for (const group of humanFeat?.origin_feat_choices ?? []) {
      const selected = state.human_origin_feat_trait_options.filter(
        (opt) =>
          opt.trait_id === group.trait_id &&
          opt.option_group === group.option_group,
      );
      if (selected.length !== group.choice_count) {
        throw new ApiError(
          `Complete as escolhas do feat Versátil: ${group.trait_name}.`,
          400,
        );
      }
      trait_options.push(...selected);
    }
  }

  trait_options.push(...state.class_trait_option_selections);
  trait_options.push(...state.progression_feat_trait_options);

  const feats: CreateCharacterBuilderPayload["feats"] = [];
  if (state.human_origin_feat_id) {
    feats.push({
      feat_id: state.human_origin_feat_id,
      source_type: "species",
      source_id: species.id,
    });
  }
  feats.push(...buildProgressionFeatsPayload(data, state));

  const equipment = background.equipment_options.find(
    (opt) => opt.option_key === state.equipment_option_key,
  );
  const inventory = (equipment?.items ?? [])
    .filter((item) => item.item_id !== null)
    .map((item) => ({
      item_id: item.item_id as number,
      quantity: item.quantity,
      is_equipped: false,
    }));

  for (const group of cls.tool_choices) {
    const selected = state.class_tool_selections.filter(
      (entry) =>
        entry.source_type === "class" && entry.source_id === cls.id,
    );
    if (selected.length !== group.choice_count) {
      throw new ApiError(
        `Selecione ${group.choice_count} ferramenta(s) de classe: ${group.option_group}.`,
        400,
      );
    }
  }

  const requiredBackgroundToolChoices = background.tool_proficiency_options.filter(
    (opt) => !opt.tool_id && opt.tool_category,
  );
  for (const opt of requiredBackgroundToolChoices) {
    const selected = state.background_tool_selections.filter(
      (entry) =>
        entry.source_type === "background" && entry.source_id === background.id,
    );
    if (selected.length !== opt.choice_count) {
      throw new ApiError(
        `Selecione a ferramenta do antecedente: ${opt.name}.`,
        400,
      );
    }
  }

  const backgroundTools: typeof state.background_tool_selections = [
    ...state.background_tool_selections,
  ];
  for (const opt of background.tool_proficiency_options) {
    if (opt.tool_id) {
      backgroundTools.push({
        tool_id: opt.tool_id,
        name: opt.name,
        source_type: "background",
        source_id: background.id,
      });
    }
  }

  const proficiencies = [
    ...state.class_tool_selections,
    ...backgroundTools,
  ];

  const expertiseError = validateExpertiseSelections(cls, data, state);
  if (expertiseError) {
    throw new ApiError(expertiseError, 400);
  }

  const optionalError = validateOptionalFeatureSelections(cls, state);
  if (optionalError) {
    throw new ApiError(optionalError, 400);
  }

  const progressionError = validateProgressionFeatSelections(data, state, abilities);
  if (progressionError) {
    throw new ApiError(progressionError, 400);
  }

  const skillsPayload = buildSkillsPayloadWithExpertise(data, state);

  const spellError = validateSpellSelections(cls.spellcasting, state);
  if (spellError) {
    throw new ApiError(spellError, 400);
  }

  const featSpellError = validateFeatSpellSelections(data, state);
  if (featSpellError) {
    throw new ApiError(featSpellError, 400);
  }

  const spells = classRequiresSpellSelection(cls.spellcasting)
    ? buildSpellsRpcPayload(state)
    : [];
  const trait_spell_choices = buildFeatSpellsRpcPayload(data, state);

  const constitution = abilities.CON;
  const max_hp = computeMaxHp(cls.hit_die, abilityModifier(constitution), state.class_level);

  return {
    name,
    class_id: cls.id,
    class_level: state.class_level,
    subclass_id: state.subclass_id,
    species_id: species.id,
    background_id: background.id,
    size,
    abilities,
    max_hp,
    class_skill_ids: state.class_skill_ids,
    proficiencies,
    trait_options,
    feats,
    inventory,
    spells,
    trait_spell_choices,
    _skillsPayload: skillsPayload,
  } as CreateCharacterBuilderPayload & { _skillsPayload: typeof skillsPayload };
}

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
    abilities: {
      STR: abilities.STR,
      DEX: abilities.DEX,
      CON: abilities.CON,
      INT: abilities.INT,
      WIS: abilities.WIS,
      CHA: abilities.CHA,
    },
    classes: [{
      class_id: payload.class_id,
      class_level: payload.class_level,
      subclass_id: payload.subclass_id,
    }],
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
