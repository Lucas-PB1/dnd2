import type {
  BuilderSpellOption,
  BuilderTraitOption,
  CharacterBuilderData,
  CharacterBuilderState,
  FeatSpellSource,
  TraitOptionSelection,
} from "@/features/character-builder/types/builder.types";

/** Mantém itens selecionados visíveis; oculta o restante já usado em outra lista. */
export function visibleWhenTaken<T>(
  items: T[],
  selectedIds: Iterable<number>,
  takenIds: Iterable<number>,
  getId: (item: T) => number,
): T[] {
  const selected = new Set(selectedIds);
  const taken = new Set(takenIds);
  return items.filter((item) => {
    const id = getId(item);
    return selected.has(id) || !taken.has(id);
  });
}

export type SpellSelectionScope = {
  cantrips?: boolean;
  spellbook?: boolean;
  prepared?: boolean;
  featSources?: FeatSpellSource[];
  /** Magias de feats de progressão no mesmo slot não contam como "tomadas". */
  featSpellPrefix?: string;
};

export function spellIdsTakenElsewhere(
  state: CharacterBuilderState,
  scope: SpellSelectionScope = {},
): number[] {
  const ids: number[] = [];

  if (!scope.cantrips) {
    ids.push(...state.cantrip_spell_ids);
  }
  if (!scope.spellbook) {
    ids.push(...state.spellbook_spell_ids);
  }
  if (!scope.prepared) {
    ids.push(...state.prepared_spell_ids);
  }

  const excludedFeatSources = new Set(scope.featSources ?? []);
  for (const entry of state.feat_spell_selections) {
    if (excludedFeatSources.has(entry.source)) continue;
    if (
      scope.featSpellPrefix !== undefined &&
      entry.source === "progression" &&
      entry.selection_key.startsWith(scope.featSpellPrefix)
    ) {
      continue;
    }
    ids.push(entry.spell_id);
  }

  return ids;
}

export function visibleSpells(
  spells: BuilderSpellOption[],
  selectedIds: number[],
  takenIds: number[],
): BuilderSpellOption[] {
  return visibleWhenTaken(
    spells,
    selectedIds,
    takenIds,
    (spell) => spell.spell_id,
  );
}

export function visibleTraitOptionsForGroup(
  options: BuilderTraitOption[],
  group: { trait_id: number; option_group: string },
  allSelections: TraitOptionSelection[],
): BuilderTraitOption[] {
  const inGroup = (entry: TraitOptionSelection) =>
    entry.trait_id === group.trait_id &&
    entry.option_group === group.option_group;

  const selectedInGroup = allSelections
    .filter(inGroup)
    .map((entry) => entry.trait_option_id);
  const takenElsewhere = allSelections
    .filter((entry) => !inGroup(entry))
    .map((entry) => entry.trait_option_id);

  return visibleWhenTaken(
    options,
    selectedInGroup,
    [...takenElsewhere, ...selectedInGroup],
    (option) => option.trait_option_id,
  );
}

export function visibleHumanOriginFeats(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
) {
  const background = data.backgrounds.find(
    (entry) => entry.id === state.background_id,
  );
  if (!background?.origin_feat_id) return data.origin_feats;

  return data.origin_feats.filter(
    (feat) => feat.id !== background.origin_feat_id,
  );
}
