import type {
  BuilderBackgroundEntry,
  BuilderOriginFeatChoice,
  CharacterBuilderState,
  TraitOptionSelection,
} from "@/features/character-builder/types/builder.types";

export type LockedOriginFeatSelection = TraitOptionSelection & {
  option_name: string;
  trait_name: string;
};

export function findLockedOriginFeatSelection(
  background: BuilderBackgroundEntry,
): LockedOriginFeatSelection | null {
  const key = background.origin_feat_selection_key?.trim();
  if (!key) return null;

  for (const group of background.origin_feat_choices) {
    const option = group.options.find((entry) => entry.name === key);
    if (option) {
      return {
        trait_id: group.trait_id,
        trait_name: group.trait_name,
        option_group: group.option_group,
        selection_key: key,
        trait_option_id: option.trait_option_id,
        option_name: option.name,
      };
    }
  }

  return null;
}

export function getVisibleOriginFeatChoices(
  background: BuilderBackgroundEntry,
): BuilderOriginFeatChoice[] {
  const locked = findLockedOriginFeatSelection(background);
  if (!locked) return background.origin_feat_choices;

  return background.origin_feat_choices.filter(
    (group) =>
      !(
        group.trait_id === locked.trait_id &&
        group.option_group === locked.option_group
      ),
  );
}

export function mergeOriginFeatTraitOptions(
  background: BuilderBackgroundEntry,
  options: TraitOptionSelection[],
): TraitOptionSelection[] {
  const locked = findLockedOriginFeatSelection(background);
  if (!locked) return options;

  const withoutLockedGroup = options.filter(
    (entry) =>
      !(
        entry.trait_id === locked.trait_id &&
        entry.option_group === locked.option_group
      ),
  );

  return [...withoutLockedGroup, locked];
}

export function applyLockedOriginFeatToState(
  state: CharacterBuilderState,
  background: BuilderBackgroundEntry | null | undefined,
): CharacterBuilderState {
  if (!background) return state;

  const merged = mergeOriginFeatTraitOptions(
    background,
    state.origin_feat_trait_options,
  );

  if (
    merged.length === state.origin_feat_trait_options.length &&
    merged.every((entry, index) => {
      const current = state.origin_feat_trait_options[index];
      return (
        current?.trait_id === entry.trait_id &&
        current?.option_group === entry.option_group &&
        current?.trait_option_id === entry.trait_option_id &&
        current?.selection_key === entry.selection_key
      );
    })
  ) {
    return state;
  }

  return {
    ...state,
    origin_feat_trait_options: merged,
  };
}
