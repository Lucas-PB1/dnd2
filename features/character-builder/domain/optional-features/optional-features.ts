import type {
  BuilderClassEntry,
  BuilderOptionalFeatureGroup,
  CharacterBuilderData,
  CharacterBuilderState,
  TraitOptionSelection,
} from "@/features/character-builder/types/builder.types";
import { toggleTraitOption } from "@/features/character-builder/domain/utils";

export function optionalFeatureGroupKey(
  traitId: number,
  optionGroup: string,
): string {
  return `${traitId}:${optionGroup}`;
}

export function classRequiresOptionalFeatureSelection(
  groups: BuilderOptionalFeatureGroup[] | null | undefined,
): boolean {
  return (groups?.length ?? 0) > 0;
}

export function totalOptionalFeatureChoicesRequired(
  groups: BuilderOptionalFeatureGroup[],
): number {
  return groups.reduce((sum, group) => sum + group.choice_count, 0);
}

export function selectionsForOptionalGroup(
  state: CharacterBuilderState,
  group: BuilderOptionalFeatureGroup,
): TraitOptionSelection[] {
  return state.class_trait_option_selections.filter(
    (entry) =>
      entry.trait_id === group.trait_id &&
      entry.option_group === group.option_group,
  );
}

export function toggleOptionalFeatureOption(
  state: CharacterBuilderState,
  group: BuilderOptionalFeatureGroup,
  selection: TraitOptionSelection,
): CharacterBuilderState {
  return {
    ...state,
    class_trait_option_selections: toggleTraitOption(
      state.class_trait_option_selections,
      selection,
      group.choice_count,
    ),
  };
}

export function validateOptionalFeatureSelections(
  cls: BuilderClassEntry | null | undefined,
  state: CharacterBuilderState,
): string | null {
  const groups = cls?.optional_feature_groups ?? [];
  if (!groups.length) return null;

  for (const group of groups) {
    const selected = selectionsForOptionalGroup(state, group);
    if (selected.length !== group.choice_count) {
      return `Selecione ${group.choice_count} opção(ões): ${group.trait_name}.`;
    }

    const allowed = new Set(group.options.map((opt) => opt.trait_option_id));
    for (const entry of selected) {
      if (!allowed.has(entry.trait_option_id)) {
        return `Opção inválida para ${group.trait_name}.`;
      }
    }
  }

  return null;
}

export function pruneOptionalFeatureSelections(
  state: CharacterBuilderState,
  data: CharacterBuilderData,
): TraitOptionSelection[] {
  const cls = data.classes.find((entry) => entry.id === state.class_id);
  if (!cls) return [];

  const allowedGroups = new Set(
    cls.optional_feature_groups.map((group) =>
      optionalFeatureGroupKey(group.trait_id, group.option_group),
    ),
  );

  return state.class_trait_option_selections.filter((entry) =>
    allowedGroups.has(optionalFeatureGroupKey(entry.trait_id, entry.option_group)),
  );
}
