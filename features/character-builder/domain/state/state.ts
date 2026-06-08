import {
  emptyAbilityAssignment,
  emptyPointBuyAssignment,
  emptyRollSlotAssignment,
} from "@/features/character-builder/domain/abilities/abilities";
import {
  MAX_ROLL_ATTEMPTS,
  isRollSetValid,
  rollAbilitySet,
} from "@/features/character-builder/domain/abilities/ability-generation";
import {
  emptyProgressionFeatSlots,
  syncProgressionFeatSlots,
} from "@/features/character-builder/domain/progression/feats";
import type {
  AbilityMethod,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";

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
    class_level: 1,
    subclass_id: null,
    secondary_class: null,
    class_skill_ids: [],
    class_tool_selections: [],
    background_tool_selections: [],
    species_trait_options: [],
    origin_feat_trait_options: [],
    human_origin_feat_id: null,
    human_origin_feat_trait_options: [],
    equipment_mode: "background",
    equipment_option_key: null,
    shop_purchases: [],
    cantrip_spell_ids: [],
    spellbook_spell_ids: [],
    prepared_spell_ids: [],
    feat_spell_selections: [],
    expertise_by_trait: {},
    class_trait_option_selections: [],
    progression_feat_slots: emptyProgressionFeatSlots(1),
    progression_feat_trait_options: [],
    size: null,
    name: "",
  };
}

export function selectedRollSet(state: CharacterBuilderState): number[] | null {
  if (state.selected_roll_index === null) return null;
  return state.roll_sets[state.selected_roll_index] ?? null;
}

function clearChoiceFields(
  state: CharacterBuilderState,
  options: { includeOriginFeatOptions?: boolean } = {},
): CharacterBuilderState {
  const includeOriginFeatOptions = options.includeOriginFeatOptions ?? true;
  return {
    ...state,
    class_skill_ids: [],
    class_tool_selections: [],
    background_tool_selections: [],
    species_trait_options: [],
    ...(includeOriginFeatOptions
      ? { origin_feat_trait_options: [] as CharacterBuilderState["origin_feat_trait_options"] }
      : {}),
    human_origin_feat_id: null,
    human_origin_feat_trait_options: [],
    equipment_mode: "background",
    equipment_option_key: null,
    shop_purchases: [],
    cantrip_spell_ids: [],
    spellbook_spell_ids: [],
    prepared_spell_ids: [],
    feat_spell_selections: [],
    expertise_by_trait: {},
    class_trait_option_selections: [],
    progression_feat_trait_options: [],
  };
}

function clearClassAndChoices(
  state: CharacterBuilderState,
  options: { includeOriginFeatOptions?: boolean } = {},
): CharacterBuilderState {
  return clearChoiceFields({ ...state, class_id: null, subclass_id: null }, options);
}

export function resetDependentState(
  state: CharacterBuilderState,
  fromStep: number,
): CharacterBuilderState {
  if (fromStep <= 1) {
    return clearClassAndChoices(state, { includeOriginFeatOptions: false });
  }

  if (fromStep <= 2) {
    return clearClassAndChoices({
      ...state,
      background_asi: { mode: "split", plus2: null, plus1: null },
    });
  }

  if (fromStep <= 3) {
    const cleared = clearChoiceFields(state);
    return {
      ...cleared,
      progression_feat_slots: syncProgressionFeatSlots(cleared),
    };
  }

  return state;
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
