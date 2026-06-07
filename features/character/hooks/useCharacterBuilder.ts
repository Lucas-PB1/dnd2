import {
  applyBackgroundAsi,
  emptyAbilityAssignment,
  emptyPointBuyAssignment,
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
    equipment_option_key: null,
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
    next.background_asi = { mode: "split", plus2: null, plus1: null };
    next.class_id = null;
    next.class_skill_ids = [];
    next.class_tool_selections = [];
    next.background_tool_selections = [];
    next.species_trait_options = [];
    next.origin_feat_trait_options = [];
    next.human_origin_feat_id = null;
    next.equipment_option_key = null;
  } else if (fromStep <= 2) {
    next.class_skill_ids = [];
    next.class_tool_selections = [];
    next.background_tool_selections = [];
    next.species_trait_options = [];
    next.origin_feat_trait_options = [];
    next.human_origin_feat_id = null;
    next.equipment_option_key = null;
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
      if (!state.background_id) return "Escolha um antecedente.";
      const species = selectedSpecies(data, state);
      const sizes = species ? parseSizeOptions(species.size_options) : [];
      if (sizes.length > 1 && !state.size) {
        return "Escolha o tamanho do personagem.";
      }
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
    case 2: {
      if (!data) return "Carregando catálogo…";
      if (!state.class_id) return "Escolha uma classe.";
      return null;
    }
    case 3: {
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

      for (const group of background.origin_feat_choices) {
        const count = state.origin_feat_trait_options.filter(
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
      return null;
    }
    case 4: {
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

  if (state.ability_method === "standard" || state.ability_method === "roll") {
    if (score !== null) {
      for (const key of ABILITY_KEYS) {
        if (key !== ability && next.ability_assignment[key] === score) {
          next.ability_assignment[key] = null;
        }
      }
    }
  }

  next.ability_assignment[ability] = score;
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

  return {
    ...state,
    class_skill_ids: toggleIdList(state.class_skill_ids, skillId, max),
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

  return {
    ...state,
    origin_feat_trait_options: toggleTraitOption(
      state.origin_feat_trait_options,
      enriched,
      max,
    ),
  };
}

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
