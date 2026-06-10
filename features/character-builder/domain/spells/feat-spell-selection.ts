import type {
  CharacterBuilderState,
  FeatSpellSelection,
  FeatSpellSource,
} from "@/features/character-builder/types/builder.types";
import { selectionKey } from "@/features/character-builder/domain/utils";

export function getFeatSpellSelectionsForSource(
  state: CharacterBuilderState,
  source: FeatSpellSource,
  traitId: number,
  choiceGroup: string,
  selectionKeyPrefix?: string,
): FeatSpellSelection[] {
  return state.feat_spell_selections.filter(
    (entry) =>
      entry.source === source &&
      entry.trait_id === traitId &&
      entry.choice_group === choiceGroup &&
      (selectionKeyPrefix === undefined ||
        entry.selection_key.startsWith(selectionKeyPrefix)),
  );
}

export function toggleFeatSpellInGroup(
  state: CharacterBuilderState,
  params: {
    source: FeatSpellSource;
    trait_id: number;
    choice_group: string;
    choice_count: number;
    spell_level: number;
    spell_id: number;
    selectionKeyPrefix?: string;
  },
): CharacterBuilderState {
  const selected = getFeatSpellSelectionsForSource(
    state,
    params.source,
    params.trait_id,
    params.choice_group,
    params.selectionKeyPrefix,
  );
  const existing = selected.find((entry) => entry.spell_id === params.spell_id);

  if (existing) {
    const slotPart = existing.selection_key.split(":").at(-1) ?? "0";
    const slotIndex = Number.parseInt(slotPart, 10);
    return toggleFeatSpell(state, {
      ...params,
      slot_index: Number.isNaN(slotIndex) ? 0 : slotIndex,
    });
  }

  if (selected.length >= params.choice_count) return state;

  let slotIndex = 0;
  const usedSlots = new Set(selected.map((entry) => entry.selection_key));
  while (
    usedSlots.has(
      buildFeatSpellSelectionKey(
        params.choice_group,
        slotIndex,
        params.selectionKeyPrefix,
      ),
    )
  ) {
    slotIndex += 1;
  }

  return toggleFeatSpell(state, { ...params, slot_index: slotIndex });
}

function buildFeatSpellSelectionKey(
  choiceGroup: string,
  slotIndex: number,
  selectionKeyPrefix?: string,
): string {
  const key = selectionKey(choiceGroup, slotIndex);
  return selectionKeyPrefix ? `${selectionKeyPrefix}${key}` : key;
}

export function toggleFeatSpell(
  state: CharacterBuilderState,
  params: {
    source: FeatSpellSource;
    trait_id: number;
    choice_group: string;
    choice_count: number;
    spell_level: number;
    slot_index: number;
    spell_id: number;
    selectionKeyPrefix?: string;
  },
): CharacterBuilderState {
  const selection_key = buildFeatSpellSelectionKey(
    params.choice_group,
    params.slot_index,
    params.selectionKeyPrefix,
  );
  const matchesSource = (entry: FeatSpellSelection) =>
    entry.source === params.source &&
    entry.trait_id === params.trait_id &&
    entry.choice_group === params.choice_group &&
    (params.selectionKeyPrefix === undefined ||
      entry.selection_key.startsWith(params.selectionKeyPrefix));

  const existing = state.feat_spell_selections.find(
    (entry) => matchesSource(entry) && entry.selection_key === selection_key,
  );

  if (existing?.spell_id === params.spell_id) {
    return {
      ...state,
      feat_spell_selections: state.feat_spell_selections.filter(
        (entry) => entry !== existing,
      ),
    };
  }

  const withoutSlot = state.feat_spell_selections.filter(
    (entry) => !(matchesSource(entry) && entry.selection_key === selection_key),
  );
  const withoutDuplicateSpell = withoutSlot.filter(
    (entry) => !(matchesSource(entry) && entry.spell_id === params.spell_id),
  );
  const currentInGroup = withoutDuplicateSpell.filter((entry) =>
    matchesSource(entry),
  );

  if (!existing && currentInGroup.length >= params.choice_count) return state;

  return {
    ...state,
    feat_spell_selections: [
      ...withoutDuplicateSpell,
      {
        source: params.source,
        trait_id: params.trait_id,
        choice_group: params.choice_group,
        selection_key,
        spell_level: params.spell_level,
        spell_id: params.spell_id,
      },
    ],
  };
}
