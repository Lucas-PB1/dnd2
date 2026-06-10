import type {
  BuilderFeatSpellcasting,
  BuilderOriginFeatChoice,
  CharacterBuilderData,
  CharacterBuilderState,
  FeatSpellSource,
  TraitOptionSelection,
} from "@/features/character-builder/types/builder.types";
import { mergeOriginFeatTraitOptions } from "@/features/character-builder/domain/origin-feat";
import {
  progressionTraitOptionsForSlot,
  syncProgressionFeatSlots,
} from "@/features/character-builder/domain/progression/feats";
import {
  featRequiresSpellSelection,
  progressionFeatSpellKeyPrefix,
  resolveFeatSpellListSelection,
} from "@/features/character-builder/domain/spells/feat-spell-lists";
import { getFeatSpellSelectionsForSource } from "@/features/character-builder/domain/spells/feat-spell-selection";

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

function buildFeatSpellRpcForSource(
  spellcasting: BuilderFeatSpellcasting,
  traitOptions: TraitOptionSelection[],
  originFeatChoices: BuilderOriginFeatChoice[],
  lockedSpellListName: string | null | undefined,
  state: CharacterBuilderState,
  source: FeatSpellSource,
  source_type: string,
  source_id: number,
  selectionKeyPrefix?: string,
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
      selectionKeyPrefix,
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

  for (const slot of syncProgressionFeatSlots(state)) {
    if (slot.kind !== "feat" || !slot.feat_id) continue;

    const feat = data.progression_feats.find((entry) => entry.id === slot.feat_id);
    if (!featRequiresSpellSelection(feat?.spellcasting)) continue;

    entries.push(
      ...buildFeatSpellRpcForSource(
        feat!.spellcasting!,
        progressionTraitOptionsForSlot(state, slot.at_level),
        feat!.origin_feat_choices,
        null,
        state,
        "progression",
        "class",
        state.class_id ?? 0,
        progressionFeatSpellKeyPrefix(slot.at_level),
      ),
    );
  }

  return entries;
}
