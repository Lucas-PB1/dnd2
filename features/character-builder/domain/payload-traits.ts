import { ApiError } from "@/lib/api/errors";
import { mergeOriginFeatTraitOptions } from "@/features/character-builder/domain/origin-feat";
import type {
  CharacterBuilderData,
  CharacterBuilderState,
  TraitOptionSelection,
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

export function buildTraitOptions(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
  background: CharacterBuilderData["backgrounds"][number],
  species: CharacterBuilderData["species"][number],
): TraitOptionSelection[] {
  validateSpeciesTraitOptions(state, species);

  if (species.name === "Human" && !state.human_origin_feat_id) {
    throw new ApiError("Humanos devem escolher um feat de origem (Versátil).", 400);
  }

  const traitOptions: TraitOptionSelection[] = [...state.species_trait_options];
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
    if (
      requiredChoiceCountError({
        selectedCount: selected.length,
        choiceCount: group.choice_count,
        isRequired: group.is_required,
      })
    ) {
      throw new ApiError(
        `Complete as escolhas do feat de origem: ${group.trait_name}.`,
        400,
      );
    }
    traitOptions.push(
      ...selected.map((entry) => ({
        ...entry,
        selection_key:
          background.origin_feat_selection_key ?? entry.selection_key,
      })),
    );
  }

  pushHumanFeatTraitOptions(data, state, traitOptions);
  traitOptions.push(...state.class_trait_option_selections);
  traitOptions.push(...state.progression_feat_trait_options);
  return traitOptions;
}

function validateSpeciesTraitOptions(
  state: CharacterBuilderState,
  species: CharacterBuilderData["species"][number],
) {
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
}

function pushHumanFeatTraitOptions(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
  traitOptions: TraitOptionSelection[],
) {
  if (!state.human_origin_feat_id) return;

  const humanFeat = data.origin_feats.find(
    (entry) => entry.id === state.human_origin_feat_id,
  );
  for (const group of humanFeat?.origin_feat_choices ?? []) {
    const selected = state.human_origin_feat_trait_options.filter(
      (opt) =>
        opt.trait_id === group.trait_id &&
        opt.option_group === group.option_group,
    );
    if (
      requiredChoiceCountError({
        selectedCount: selected.length,
        choiceCount: group.choice_count,
        isRequired: group.is_required,
      })
    ) {
      throw new ApiError(
        `Complete as escolhas do feat Versátil: ${group.trait_name}.`,
        400,
      );
    }
    traitOptions.push(...selected);
  }
}
