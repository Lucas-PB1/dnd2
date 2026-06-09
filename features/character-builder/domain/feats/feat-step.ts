import { applyBackgroundAsi } from "@/features/character-builder/domain/abilities/abilities";
import {
  findLockedOriginFeatSelection,
  getVisibleOriginFeatChoices,
  mergeOriginFeatTraitOptions,
} from "@/features/character-builder/domain/origin-feat";
import {
  progressionFeatLevelsForClass,
  validateProgressionFeatSelections,
} from "@/features/character-builder/domain/progression/feats";
import {
  selectedBackground,
  selectedSpecies,
} from "@/features/character-builder/domain/state/selectors";
import type {
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";

function requiredChoiceCountError(params: {
  selectedCount: number;
  choiceCount: number;
  isRequired?: boolean;
}): boolean {
  if (params.isRequired === false) {
    return params.selectedCount > 0 && params.selectedCount !== params.choiceCount;
  }
  return params.selectedCount !== params.choiceCount;
}

export function hasOriginFeatContent(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
): boolean {
  const species = selectedSpecies(data, state);
  const background = selectedBackground(data, state);
  if (!species || !background) return false;

  return (
    species.name === "Human" ||
    findLockedOriginFeatSelection(background) !== null ||
    getVisibleOriginFeatChoices(background).length > 0
  );
}

export function hasProgressionFeatContent(state: CharacterBuilderState): boolean {
  return progressionFeatLevelsForClass(state.class_level).length > 0;
}

export function requiresFeatStepContent(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
): boolean {
  return hasOriginFeatContent(data, state) || hasProgressionFeatContent(state);
}

export function validateFeatStep(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
): string | null {
  if (!requiresFeatStepContent(data, state)) return null;

  const species = selectedSpecies(data, state);
  const background = selectedBackground(data, state);
  if (!species || !background) return "Seleções incompletas.";

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
    if (
      requiredChoiceCountError({
        selectedCount: count,
        choiceCount: group.choice_count,
        isRequired: group.is_required,
      })
    ) {
      return `Complete as escolhas do feat: ${group.trait_name}.`;
    }
  }

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
      if (
        requiredChoiceCountError({
          selectedCount: count,
          choiceCount: group.choice_count,
          isRequired: group.is_required,
        })
      ) {
        return `Complete as escolhas do feat Versátil: ${group.trait_name}.`;
      }
    }
  }

  if (hasProgressionFeatContent(state)) {
    const abilities = applyBackgroundAsi(
      state.ability_assignment,
      background.ability_options,
      state.background_asi,
    );
    const progressionError = validateProgressionFeatSelections(
      data,
      state,
      abilities,
    );
    if (progressionError) return progressionError;
  }

  return null;
}
