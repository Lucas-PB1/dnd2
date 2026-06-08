import {
  applyBackgroundAsi,
  emptyAbilityAssignment,
  emptyPointBuyAssignment,
  emptyRollSlotAssignment,
  isBaseAbilitiesComplete,
  parseSizeOptions,
} from "@/lib/character/abilities";
import {
  MAX_ROLL_ATTEMPTS,
  isRollSetValid,
  rollAbilitySet,
} from "@/lib/character/ability-generation";
import {
  selectionKey,
  toggleIdList,
  toggleTraitOption,
} from "@/lib/character/builder-utils";
import {
  classRequiresExpertiseSelection,
  eligibleSkillsForExpertiseGroup,
  getExpertiseSelectionsForTrait,
  totalExpertiseChoicesRequired,
  toggleExpertiseSkill,
  validateExpertiseSelections,
} from "@/lib/character/class-expertise";
import {
  classRequiresSpellSelection,
  toggleSpellId,
  validateSpellSelections,
} from "@/lib/character/class-spells";
import {
  featRequiresSpellSelection,
  toggleFeatSpell,
  validateFeatSpellSelections,
} from "@/lib/character/feat-spells";
import { mergeOriginFeatTraitOptions } from "@/lib/character/origin-feat";
import type {
  AbilityKey,
  AbilityMethod,
  BackgroundAsiSelection,
  CharacterBuilderData,
  CharacterBuilderState,
  ToolProficiencySelection,
  TraitOptionSelection,
} from "@/features/character/types/builder.types";
import { ABILITY_KEYS, BUILDER_STEPS } from "@/features/character/types/builder.types";

export function createInitialBuilderState(): CharacterBuilderState {
  return {
    step: 0,
    ability_method: "standard",
    ability_assignment: emptyAbilityAssignment(),
    roll_slot_assignment: emptyRollSlotAssignment(),
    roll_sets: [],
    selected_roll_index: null,
    species_id: null,
    background_id: null,
    background_asi: { mode: "split", plus2: null, plus1: null },
    class_id: null,
    class_skill_ids: [],
    class_tool_selections: [],
    background_tool_selections: [],
    species_trait_options: [],
    origin_feat_trait_options: [],
    human_origin_feat_id: null,
    human_origin_feat_trait_options: [],
    equipment_option_key: null,
    cantrip_spell_ids: [],
    spellbook_spell_ids: [],
    prepared_spell_ids: [],
    feat_spell_selections: [],
    expertise_by_trait: {},
    size: null,
    name: "",
  };
}

export function selectedRollSet(state: CharacterBuilderState): number[] | null {
  if (state.selected_roll_index === null) return null;
  return state.roll_sets[state.selected_roll_index] ?? null;
}

export function resetDependentState(
  state: CharacterBuilderState,
  fromStep: number,
): CharacterBuilderState {
  const next = { ...state };

  if (fromStep <= 1) {
    next.class_id = null;
    next.class_skill_ids = [];
    next.class_tool_selections = [];
    next.background_tool_selections = [];
    next.species_trait_options = [];
    next.human_origin_feat_id = null;
    next.human_origin_feat_trait_options = [];
    next.equipment_option_key = null;
    next.cantrip_spell_ids = [];
    next.spellbook_spell_ids = [];
    next.prepared_spell_ids = [];
    next.feat_spell_selections = [];
    next.expertise_by_trait = {};
  }

  if (fromStep <= 2) {
    next.background_asi = { mode: "split", plus2: null, plus1: null };
    next.class_id = null;
    next.class_skill_ids = [];
    next.class_tool_selections = [];
    next.background_tool_selections = [];
    next.species_trait_options = [];
    next.origin_feat_trait_options = [];
    next.human_origin_feat_id = null;
    next.human_origin_feat_trait_options = [];
    next.equipment_option_key = null;
    next.cantrip_spell_ids = [];
    next.spellbook_spell_ids = [];
    next.prepared_spell_ids = [];
    next.feat_spell_selections = [];
    next.expertise_by_trait = {};
  } else if (fromStep <= 3) {
    next.class_skill_ids = [];
    next.class_tool_selections = [];
    next.background_tool_selections = [];
    next.species_trait_options = [];
    next.origin_feat_trait_options = [];
    next.human_origin_feat_id = null;
    next.human_origin_feat_trait_options = [];
    next.equipment_option_key = null;
    next.cantrip_spell_ids = [];
    next.spellbook_spell_ids = [];
    next.prepared_spell_ids = [];
    next.feat_spell_selections = [];
    next.expertise_by_trait = {};
  }

  return next;
}

export function setAbilityMethod(
  state: CharacterBuilderState,
  method: AbilityMethod,
): CharacterBuilderState {
  return {
    ...state,
    ability_method: method,
    ability_assignment:
      method === "point_buy"
        ? emptyPointBuyAssignment()
        : emptyAbilityAssignment(),
    roll_slot_assignment: emptyRollSlotAssignment(),
    roll_sets: [],
    selected_roll_index: null,
  };
}

export function addRollSet(state: CharacterBuilderState): CharacterBuilderState {
  if (state.roll_sets.length >= MAX_ROLL_ATTEMPTS) return state;

  return {
    ...state,
    roll_sets: [...state.roll_sets, rollAbilitySet()],
    ability_assignment: emptyAbilityAssignment(),
    roll_slot_assignment: emptyRollSlotAssignment(),
    selected_roll_index: null,
  };
}

export function selectRollSet(
  state: CharacterBuilderState,
  index: number,
): CharacterBuilderState {
  const set = state.roll_sets[index];
  if (!set || !isRollSetValid(set)) return state;

  return {
    ...state,
    selected_roll_index: index,
    ability_assignment: emptyAbilityAssignment(),
    roll_slot_assignment: emptyRollSlotAssignment(),
  };
}

function selectedClass(data: CharacterBuilderData, state: CharacterBuilderState) {
  return data.classes.find((entry) => entry.id === state.class_id) ?? null;
}

function selectedSpecies(data: CharacterBuilderData, state: CharacterBuilderState) {
  return data.species.find((entry) => entry.id === state.species_id) ?? null;
}

function selectedBackground(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
) {
  return data.backgrounds.find((entry) => entry.id === state.background_id) ?? null;
}

export function validateBuilderStep(
  data: CharacterBuilderData | null,
  state: CharacterBuilderState,
  step: number,
): string | null {
  switch (step) {
    case 0: {
      if (
        !isBaseAbilitiesComplete(
          state.ability_method,
          state.ability_assignment,
          selectedRollSet(state),
        )
      ) {
        if (state.ability_method === "standard") {
          return "Distribua o array padrão (15, 14, 13, 12, 10, 8) entre os atributos.";
        }
        if (state.ability_method === "point_buy") {
          return "Gaste exatamente 27 pontos (atributos entre 8 e 15).";
        }
        if (state.selected_roll_index === null) {
          return "Escolha um conjunto de rolagem válido (soma entre 72 e 80).";
        }
        return "Atribua os valores rolados entre os seis atributos.";
      }
      return null;
    }
    case 1: {
      if (!data) return "Carregando catálogo…";
      if (!state.species_id) return "Escolha uma espécie.";
      const species = selectedSpecies(data, state);
      const sizes = species ? parseSizeOptions(species.size_options) : [];
      if (sizes.length > 1 && !state.size) {
        return "Escolha o tamanho do personagem.";
      }
      return null;
    }
    case 2: {
      if (!data) return "Carregando catálogo…";
      if (!state.background_id) return "Escolha um antecedente.";
      const background = selectedBackground(data, state);
      if (!background) return "Antecedente inválido.";
      const { background_asi: asi } = state;
      if (background.ability_options.length > 0) {
        if (asi.mode === "split") {
          if (!asi.plus2 || !asi.plus1) {
            return "Escolha +2 e +1 nos atributos do antecedente.";
          }
          if (asi.plus2 === asi.plus1) {
            return "Os bônus +2 e +1 devem ser em atributos diferentes.";
          }
          if (
            !background.ability_options.includes(asi.plus2) ||
            !background.ability_options.includes(asi.plus1)
          ) {
            return "Bônus de antecedente inválidos.";
          }
        }
      }
      return null;
    }
    case 3: {
      if (!data) return "Carregando catálogo…";
      if (!state.class_id) return "Escolha uma classe.";
      return null;
    }
    case 4: {
      if (!data) return "Carregando catálogo…";
      if (!data.details_loaded) return "Carregando escolhas…";
      const cls = selectedClass(data, state);
      const species = selectedSpecies(data, state);
      const background = selectedBackground(data, state);
      if (!cls || !species || !background) return "Seleções incompletas.";

      const requiredSkills = cls.skill_choices.reduce(
        (sum, group) => sum + group.choice_count,
        0,
      );
      if (state.class_skill_ids.length !== requiredSkills) {
        return `Selecione ${requiredSkills} perícia(s) de classe.`;
      }

      for (const group of cls.tool_choices) {
        if (state.class_tool_selections.length < group.choice_count) {
          return `Selecione ferramenta(s) de classe: ${group.option_group}.`;
        }
      }

      for (const opt of background.tool_proficiency_options) {
        if (!opt.tool_id && opt.tool_category) {
          if (state.background_tool_selections.length < opt.choice_count) {
            return "Selecione a ferramenta do antecedente.";
          }
        }
      }

      for (const trait of species.traits) {
        for (const group of trait.choice_groups) {
          if (!group.is_required) continue;
          const count = state.species_trait_options.filter(
            (entry) =>
              entry.trait_id === group.trait_id &&
              entry.option_group === group.option_group,
          ).length;
          if (count !== group.choice_count) {
            return `Complete: ${trait.name} — ${group.option_group}.`;
          }
        }
      }

      if (species.name === "Human" && !state.human_origin_feat_id) {
        return "Humanos escolhem um feat de origem (Versátil).";
      }

      const originFeatOptions = mergeOriginFeatTraitOptions(
        background,
        state.origin_feat_trait_options,
      );

      for (const group of background.origin_feat_choices) {
        const count = originFeatOptions.filter(
          (entry) =>
            entry.trait_id === group.trait_id &&
            entry.option_group === group.option_group,
        ).length;
        if (count !== group.choice_count) {
          return `Complete as escolhas do feat: ${group.trait_name}.`;
        }
      }

      if (!state.equipment_option_key) {
        return "Escolha o equipamento inicial do antecedente.";
      }

      const spellError = validateSpellSelections(cls.spellcasting, state);
      if (spellError) return spellError;

      const featSpellError = validateFeatSpellSelections(data, state);
      if (featSpellError) return featSpellError;

      if (state.human_origin_feat_id) {
        const humanFeat = data.origin_feats.find(
          (entry) => entry.id === state.human_origin_feat_id,
        );
        for (const group of humanFeat?.origin_feat_choices ?? []) {
          const count = state.human_origin_feat_trait_options.filter(
            (entry) =>
              entry.trait_id === group.trait_id &&
              entry.option_group === group.option_group,
          ).length;
          if (count !== group.choice_count) {
            return `Complete as escolhas do feat Versátil: ${group.trait_name}.`;
          }
        }
      }

      const expertiseError = validateExpertiseSelections(cls, data, state);
      if (expertiseError) return expertiseError;

      return null;
    }
    case 5: {
      if (state.name.trim().length < 2) {
        return "Informe o nome do personagem (mínimo 2 caracteres).";
      }
      return null;
    }
    default:
      return null;
  }
}

export function canAdvance(
  data: CharacterBuilderData | null,
  state: CharacterBuilderState,
): boolean {
  return validateBuilderStep(data, state, state.step) === null;
}

export function assignAbilityScore(
  state: CharacterBuilderState,
  ability: AbilityKey,
  score: number | null,
): CharacterBuilderState {
  const next = { ...state, ability_assignment: { ...state.ability_assignment } };

  // Array padrão: cada valor é único — ao reutilizar um número, libera o atributo anterior.
  // Rolagem: duplicatas são válidas (ex.: dois 13 no mesmo conjunto).
  if (state.ability_method === "standard" && score !== null) {
    for (const key of ABILITY_KEYS) {
      if (key !== ability && next.ability_assignment[key] === score) {
        next.ability_assignment[key] = null;
      }
    }
  }

  next.ability_assignment[ability] = score;
  return next;
}

export function assignRolledSlot(
  state: CharacterBuilderState,
  ability: AbilityKey,
  slotIndex: number | null,
): CharacterBuilderState {
  const pool = selectedRollSet(state);
  if (!pool) return state;

  const next = {
    ...state,
    ability_assignment: { ...state.ability_assignment },
    roll_slot_assignment: { ...state.roll_slot_assignment },
  };

  if (slotIndex === null || next.roll_slot_assignment[ability] === slotIndex) {
    next.roll_slot_assignment[ability] = null;
    next.ability_assignment[ability] = null;
    return next;
  }

  if (slotIndex < 0 || slotIndex >= pool.length) return state;

  for (const key of ABILITY_KEYS) {
    if (key !== ability && next.roll_slot_assignment[key] === slotIndex) {
      next.roll_slot_assignment[key] = null;
      next.ability_assignment[key] = null;
    }
  }

  next.roll_slot_assignment[ability] = slotIndex;
  next.ability_assignment[ability] = pool[slotIndex];
  return next;
}

function pruneExpertiseSelections(
  state: CharacterBuilderState,
  data: CharacterBuilderData,
): Record<number, number[]> {
  const cls = selectedClass(data, state);
  if (!cls) return state.expertise_by_trait;

  const next: Record<number, number[]> = {};
  for (const group of cls.expertise_choices) {
    const eligible = new Set(
      eligibleSkillsForExpertiseGroup(data, state, group).map((s) => s.skill_id),
    );
    next[group.trait_id] = (state.expertise_by_trait[group.trait_id] ?? []).filter(
      (id) => eligible.has(id),
    );
  }
  return next;
}

export function toggleClassSkill(
  state: CharacterBuilderState,
  data: CharacterBuilderData,
  skillId: number,
): CharacterBuilderState {
  const cls = selectedClass(data, state);
  if (!cls) return state;

  const max = cls.skill_choices.reduce(
    (sum, group) => sum + group.choice_count,
    0,
  );

  const nextState = {
    ...state,
    class_skill_ids: toggleIdList(state.class_skill_ids, skillId, max),
  };

  return {
    ...nextState,
    expertise_by_trait: pruneExpertiseSelections(nextState, data),
  };
}

export function toggleSpeciesTraitOption(
  state: CharacterBuilderState,
  selection: TraitOptionSelection,
  max: number,
): CharacterBuilderState {
  return {
    ...state,
    species_trait_options: toggleTraitOption(
      state.species_trait_options,
      selection,
      max,
    ),
  };
}

export function toggleOriginFeatTraitOption(
  state: CharacterBuilderState,
  data: CharacterBuilderData,
  selection: TraitOptionSelection,
  max: number,
): CharacterBuilderState {
  const background = selectedBackground(data, state);
  const enriched: TraitOptionSelection = {
    ...selection,
    selection_key:
      background?.origin_feat_selection_key ?? selection.selection_key,
  };

  const nextOptions = toggleTraitOption(
    state.origin_feat_trait_options,
    enriched,
    max,
  );

  const spellListChanged =
    background?.origin_feat_spellcasting &&
    selection.option_group ===
      background.origin_feat_spellcasting.spell_list_option_group;

  return {
    ...state,
    origin_feat_trait_options: nextOptions,
    feat_spell_selections: spellListChanged
      ? state.feat_spell_selections.filter((entry) => entry.source !== "background")
      : state.feat_spell_selections,
  };
}

export function toggleHumanOriginFeatTraitOption(
  state: CharacterBuilderState,
  data: CharacterBuilderData,
  selection: TraitOptionSelection,
  max: number,
): CharacterBuilderState {
  const humanFeat = data.origin_feats.find(
    (entry) => entry.id === state.human_origin_feat_id,
  );
  const nextOptions = toggleTraitOption(
    state.human_origin_feat_trait_options,
    selection,
    max,
  );

  const spellListChanged =
    humanFeat?.spellcasting &&
    selection.option_group === humanFeat.spellcasting.spell_list_option_group;

  return {
    ...state,
    human_origin_feat_trait_options: nextOptions,
    feat_spell_selections: spellListChanged
      ? state.feat_spell_selections.filter((entry) => entry.source !== "human")
      : state.feat_spell_selections,
  };
}

export function setHumanOriginFeat(
  state: CharacterBuilderState,
  featId: number,
): CharacterBuilderState {
  if (state.human_origin_feat_id === featId) return state;

  return {
    ...state,
    human_origin_feat_id: featId,
    human_origin_feat_trait_options: [],
    feat_spell_selections: state.feat_spell_selections.filter(
      (entry) => entry.source !== "human",
    ),
  };
}

export { toggleFeatSpell };

export function setBackgroundTool(
  state: CharacterBuilderState,
  tool: ToolProficiencySelection,
): CharacterBuilderState {
  return {
    ...state,
    background_tool_selections: [tool],
  };
}

export function setClassTool(
  state: CharacterBuilderState,
  tool: ToolProficiencySelection,
): CharacterBuilderState {
  return {
    ...state,
    class_tool_selections: [tool],
  };
}

export function toggleCantripSpell(
  state: CharacterBuilderState,
  data: CharacterBuilderData,
  spellId: number,
): CharacterBuilderState {
  const cls = selectedClass(data, state);
  const max = cls?.spellcasting?.cantrip_count ?? 0;
  if (max === 0) return state;

  const cantrip_spell_ids = toggleSpellId(state.cantrip_spell_ids, spellId, max);
  return { ...state, cantrip_spell_ids };
}

export function toggleSpellbookSpell(
  state: CharacterBuilderState,
  data: CharacterBuilderData,
  spellId: number,
): CharacterBuilderState {
  const cls = selectedClass(data, state);
  const max = cls?.spellcasting?.spellbook_count ?? 0;
  if (max === 0) return state;

  const spellbook_spell_ids = toggleSpellId(
    state.spellbook_spell_ids,
    spellId,
    max,
  );
  const prepared_spell_ids = state.prepared_spell_ids.filter((id) =>
    spellbook_spell_ids.includes(id),
  );

  return { ...state, spellbook_spell_ids, prepared_spell_ids };
}

export function togglePreparedSpell(
  state: CharacterBuilderState,
  data: CharacterBuilderData,
  spellId: number,
): CharacterBuilderState {
  const cls = selectedClass(data, state);
  const max = cls?.spellcasting?.prepared_count ?? 0;
  if (max === 0) return state;

  return {
    ...state,
    prepared_spell_ids: toggleSpellId(state.prepared_spell_ids, spellId, max),
  };
}

export {
  classRequiresExpertiseSelection,
  classRequiresSpellSelection,
  getExpertiseSelectionsForTrait,
  totalExpertiseChoicesRequired,
  toggleExpertiseSkill,
};

export function computePreviewAbilities(
  data: CharacterBuilderData | null,
  state: CharacterBuilderState,
): Record<AbilityKey, number> | null {
  const background = data ? selectedBackground(data, state) : null;
  if (
    !background ||
    !isBaseAbilitiesComplete(
      state.ability_method,
      state.ability_assignment,
      selectedRollSet(state),
    )
  ) {
    return null;
  }

  return applyBackgroundAsi(
    state.ability_assignment,
    background.ability_options,
    state.background_asi,
  );
}

export function updateBackgroundAsi(
  state: CharacterBuilderState,
  patch: Partial<BackgroundAsiSelection>,
): CharacterBuilderState {
  return {
    ...state,
    background_asi: { ...state.background_asi, ...patch },
  };
}

export { selectionKey, ABILITY_KEYS } from "@/lib/character/builder-utils";
export { BUILDER_STEPS } from "@/features/character/types/builder.types";
