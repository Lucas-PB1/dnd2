import type {
  BuilderFeatSpellcasting,
  BuilderOriginFeatChoice,
  BuilderSpellOption,
  CharacterBuilderData,
  CharacterBuilderState,
  FeatSpellSelection,
  FeatSpellSource,
  TraitOptionSelection,
} from "@/features/character/types/builder.types";
import { mergeOriginFeatTraitOptions } from "@/lib/character/origin-feat";
import { selectionKey } from "@/lib/character/builder-utils";

export type TraitSpellChoiceRpc = {
  trait_id: number;
  choice_group: string;
  selection_key: string;
  spell_level: number;
  spell_id: number;
  trait_option_id?: number;
  spell_list_id?: number;
  source_type: string;
  source_id: number;
};

export function featRequiresSpellSelection(
  spellcasting: BuilderFeatSpellcasting | null | undefined,
): boolean {
  if (!spellcasting) return false;
  return spellcasting.groups.some((group) => group.choice_count > 0);
}

export function totalFeatSpellChoicesRequired(
  spellcasting: BuilderFeatSpellcasting | null | undefined,
): number {
  if (!spellcasting) return 0;
  return spellcasting.groups.reduce((sum, group) => sum + group.choice_count, 0);
}

export function traitOptionNameFromGroups(
  groups: BuilderOriginFeatChoice[],
  selection: TraitOptionSelection,
): string | null {
  for (const group of groups) {
    const option = group.options.find(
      (entry) => entry.trait_option_id === selection.trait_option_id,
    );
    if (option) return option.name;
  }
  return null;
}

export function resolveFeatSpellListSelection(
  spellcasting: BuilderFeatSpellcasting,
  traitOptions: TraitOptionSelection[],
  originFeatChoices: BuilderOriginFeatChoice[],
  lockedSpellListName?: string | null,
): { listName: string; trait_option_id: number; spell_list_id: number } | null {
  if (lockedSpellListName) {
    const spellListId = spellcasting.spell_list_ids_by_name[lockedSpellListName];
    if (!spellListId) return null;

    const lockedOption = originFeatChoices
      .flatMap((group) => group.options)
      .find((option) => option.name === lockedSpellListName);

    return {
      listName: lockedSpellListName,
      trait_option_id: lockedOption?.trait_option_id ?? 0,
      spell_list_id: spellListId,
    };
  }

  const selection = traitOptions.find(
    (entry) =>
      entry.trait_id === spellcasting.trait_id &&
      entry.option_group === spellcasting.spell_list_option_group,
  );
  if (!selection) return null;

  const listName = traitOptionNameFromGroups(originFeatChoices, selection);
  if (!listName) return null;

  const spellListId = spellcasting.spell_list_ids_by_name[listName];
  if (!spellListId) return null;

  return {
    listName,
    trait_option_id: selection.trait_option_id,
    spell_list_id: spellListId,
  };
}

export function spellsForFeatGroup(
  spellcasting: BuilderFeatSpellcasting,
  listName: string,
  spellLevel: number,
): BuilderSpellOption[] {
  return (spellcasting.spells_by_list[listName] ?? []).filter(
    (spell) => spell.level === spellLevel,
  );
}

export function getFeatSpellSelectionsForSource(
  state: CharacterBuilderState,
  source: FeatSpellSource,
  traitId: number,
  choiceGroup: string,
): FeatSpellSelection[] {
  return state.feat_spell_selections.filter(
    (entry) =>
      entry.source === source &&
      entry.trait_id === traitId &&
      entry.choice_group === choiceGroup,
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
  },
): CharacterBuilderState {
  const selected = getFeatSpellSelectionsForSource(
    state,
    params.source,
    params.trait_id,
    params.choice_group,
  );
  const existing = selected.find((entry) => entry.spell_id === params.spell_id);

  if (existing) {
    const slotIndex = Number.parseInt(
      existing.selection_key.split(":").at(-1) ?? "0",
      10,
    );
    return toggleFeatSpell(state, {
      ...params,
      slot_index: Number.isNaN(slotIndex) ? 0 : slotIndex,
    });
  }

  if (selected.length >= params.choice_count) {
    return state;
  }

  let slotIndex = 0;
  const usedSlots = new Set(selected.map((entry) => entry.selection_key));
  while (usedSlots.has(selectionKey(params.choice_group, slotIndex))) {
    slotIndex += 1;
  }

  return toggleFeatSpell(state, {
    ...params,
    slot_index: slotIndex,
  });
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
  },
): CharacterBuilderState {
  const selection_key = selectionKey(params.choice_group, params.slot_index);
  const existing = state.feat_spell_selections.find(
    (entry) =>
      entry.source === params.source &&
      entry.trait_id === params.trait_id &&
      entry.choice_group === params.choice_group &&
      entry.selection_key === selection_key,
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
    (entry) =>
      !(
        entry.source === params.source &&
        entry.trait_id === params.trait_id &&
        entry.choice_group === params.choice_group &&
        entry.selection_key === selection_key
      ),
  );

  const withoutDuplicateSpell = withoutSlot.filter(
    (entry) =>
      !(
        entry.source === params.source &&
        entry.trait_id === params.trait_id &&
        entry.choice_group === params.choice_group &&
        entry.spell_id === params.spell_id
      ),
  );

  const currentInGroup = withoutDuplicateSpell.filter(
    (entry) =>
      entry.source === params.source &&
      entry.trait_id === params.trait_id &&
      entry.choice_group === params.choice_group,
  );

  if (!existing && currentInGroup.length >= params.choice_count) {
    return state;
  }

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

function validateFeatSpellSource(
  label: string,
  spellcasting: BuilderFeatSpellcasting,
  traitOptions: TraitOptionSelection[],
  originFeatChoices: BuilderOriginFeatChoice[],
  lockedSpellListName: string | null | undefined,
  state: CharacterBuilderState,
  source: FeatSpellSource,
): string | null {
  const listSelection = resolveFeatSpellListSelection(
    spellcasting,
    traitOptions,
    originFeatChoices,
    lockedSpellListName,
  );
  if (!listSelection) {
    return `Escolha a lista de magias do talento (${label}).`;
  }

  for (const group of spellcasting.groups) {
    const selected = getFeatSpellSelectionsForSource(
      state,
      source,
      group.trait_id,
      group.choice_group,
    );
    if (selected.length !== group.choice_count) {
      return `Selecione ${group.choice_count} magia(s) de talento: ${group.choice_group} (${label}).`;
    }

    const available = spellsForFeatGroup(
      spellcasting,
      listSelection.listName,
      group.spell_level,
    );
    const availableIds = new Set(available.map((spell) => spell.spell_id));

    for (const entry of selected) {
      if (!availableIds.has(entry.spell_id)) {
        return `Magia inválida para o talento ${label}: ${group.choice_group}.`;
      }
    }

    const uniqueSpells = new Set(selected.map((entry) => entry.spell_id));
    if (uniqueSpells.size !== selected.length) {
      return `Não repita a mesma magia em ${group.choice_group} (${label}).`;
    }
  }

  return null;
}

export function validateFeatSpellSelections(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
): string | null {
  const background = data.backgrounds.find(
    (entry) => entry.id === state.background_id,
  );
  if (!background) return null;

  if (featRequiresSpellSelection(background.origin_feat_spellcasting)) {
    const originFeatOptions = mergeOriginFeatTraitOptions(
      background,
      state.origin_feat_trait_options,
    );
    const error = validateFeatSpellSource(
      background.origin_feat_name ?? "antecedente",
      background.origin_feat_spellcasting!,
      originFeatOptions,
      background.origin_feat_choices,
      background.origin_feat_selection_key,
      state,
      "background",
    );
    if (error) return error;
  }

  if (state.human_origin_feat_id) {
    const humanFeat = data.origin_feats.find(
      (entry) => entry.id === state.human_origin_feat_id,
    );
    if (featRequiresSpellSelection(humanFeat?.spellcasting)) {
      const error = validateFeatSpellSource(
        humanFeat?.name ?? "Versátil",
        humanFeat!.spellcasting!,
        state.human_origin_feat_trait_options,
        humanFeat?.origin_feat_choices ?? [],
        null,
        state,
        "human",
      );
      if (error) return error;
    }
  }

  return null;
}

function buildFeatSpellRpcForSource(
  spellcasting: BuilderFeatSpellcasting,
  traitOptions: TraitOptionSelection[],
  originFeatChoices: BuilderOriginFeatChoice[],
  lockedSpellListName: string | null | undefined,
  state: CharacterBuilderState,
  source: FeatSpellSource,
  source_type: string,
  source_id: number,
): TraitSpellChoiceRpc[] {
  const listSelection = resolveFeatSpellListSelection(
    spellcasting,
    traitOptions,
    originFeatChoices,
    lockedSpellListName,
  );
  if (!listSelection) return [];

  const entries: TraitSpellChoiceRpc[] = [];

  for (const group of spellcasting.groups) {
    const selected = getFeatSpellSelectionsForSource(
      state,
      source,
      group.trait_id,
      group.choice_group,
    );

    for (const entry of selected) {
      entries.push({
        trait_id: entry.trait_id,
        choice_group: entry.choice_group,
        selection_key: entry.selection_key,
        spell_level: entry.spell_level,
        spell_id: entry.spell_id,
        trait_option_id: listSelection.trait_option_id || undefined,
        spell_list_id: listSelection.spell_list_id,
        source_type,
        source_id,
      });
    }
  }

  return entries;
}

export function buildFeatSpellsRpcPayload(
  data: CharacterBuilderData,
  state: CharacterBuilderState,
): TraitSpellChoiceRpc[] {
  const background = data.backgrounds.find(
    (entry) => entry.id === state.background_id,
  );
  if (!background) return [];

  const entries: TraitSpellChoiceRpc[] = [];

  if (featRequiresSpellSelection(background.origin_feat_spellcasting)) {
    const originFeatOptions = mergeOriginFeatTraitOptions(
      background,
      state.origin_feat_trait_options,
    );
    entries.push(
      ...buildFeatSpellRpcForSource(
        background.origin_feat_spellcasting!,
        originFeatOptions,
        background.origin_feat_choices,
        background.origin_feat_selection_key,
        state,
        "background",
        "background",
        background.id,
      ),
    );
  }

  if (state.human_origin_feat_id) {
    const humanFeat = data.origin_feats.find(
      (entry) => entry.id === state.human_origin_feat_id,
    );
    if (featRequiresSpellSelection(humanFeat?.spellcasting)) {
      entries.push(
        ...buildFeatSpellRpcForSource(
          humanFeat!.spellcasting!,
          state.human_origin_feat_trait_options,
          humanFeat?.origin_feat_choices ?? [],
          null,
          state,
          "human",
          "species",
          data.species.find((entry) => entry.id === state.species_id)?.id ?? 0,
        ),
      );
    }
  }

  return entries;
}
