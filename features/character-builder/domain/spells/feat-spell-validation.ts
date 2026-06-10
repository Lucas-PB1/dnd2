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
  spellsForFeatGroup,
} from "@/features/character-builder/domain/spells/feat-spell-lists";
import { getFeatSpellSelectionsForSource } from "@/features/character-builder/domain/spells/feat-spell-selection";

function validateFeatSpellSource(
  label: string,
  spellcasting: BuilderFeatSpellcasting,
  traitOptions: TraitOptionSelection[],
  originFeatChoices: BuilderOriginFeatChoice[],
  lockedSpellListName: string | null | undefined,
  state: CharacterBuilderState,
  source: FeatSpellSource,
  selectionKeyPrefix?: string,
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
      selectionKeyPrefix,
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

  for (const slot of syncProgressionFeatSlots(state)) {
    if (slot.kind !== "feat" || !slot.feat_id) continue;

    const feat = data.progression_feats.find((entry) => entry.id === slot.feat_id);
    if (!featRequiresSpellSelection(feat?.spellcasting)) continue;

    const error = validateFeatSpellSource(
      `${feat!.name} (nível ${slot.at_level})`,
      feat!.spellcasting!,
      progressionTraitOptionsForSlot(state, slot.at_level),
      feat!.origin_feat_choices,
      null,
      state,
      "progression",
      progressionFeatSpellKeyPrefix(slot.at_level),
    );
    if (error) return error;
  }

  return null;
}
