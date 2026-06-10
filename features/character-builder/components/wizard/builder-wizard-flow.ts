import {
  BUILDER_STEPS,
  type CharacterBuilderData,
  type CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";
import { totalCharacterLevel } from "@/features/character-builder/domain/multiclass/multiclass";
import { requiresFeatStepContent } from "@/features/character-builder/domain/feats/feat-step";

export function nextStepAfter(
  fromStep: number,
  catalog: CharacterBuilderData | null,
  state: CharacterBuilderState,
): number {
  if (fromStep === 4 && catalog && !requiresFeatStepContent(catalog, state)) {
    return 6;
  }
  return Math.min(fromStep + 1, BUILDER_STEPS.length - 1);
}

export function previousStepBefore(
  fromStep: number,
  catalog: CharacterBuilderData | null,
  state: CharacterBuilderState,
): number {
  if (fromStep === 6 && catalog && !requiresFeatStepContent(catalog, state)) {
    return 4;
  }
  return Math.max(fromStep - 1, 0);
}

export function clearDetailSelections(
  state: CharacterBuilderState,
): CharacterBuilderState {
  return {
    ...state,
    equipment_mode:
      totalCharacterLevel(state) <= 1 ? "background" : state.equipment_mode,
    equipment_option_key: null,
    cantrip_spell_ids: [],
    spellbook_spell_ids: [],
    prepared_spell_ids: [],
    feat_spell_selections: [],
    expertise_by_trait: {},
    class_trait_option_selections: [],
    progression_feat_trait_options: [],
  };
}
