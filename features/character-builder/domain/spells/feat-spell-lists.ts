import type {
  BuilderFeatSpellcasting,
  BuilderOriginFeatChoice,
  BuilderProgressionFeat,
  BuilderSpellOption,
  CharacterBuilderState,
  ProgressionFeatLevel,
  TraitOptionSelection,
} from "@/features/character-builder/types/builder.types";
import { progressionSlotKey, syncProgressionFeatSlots } from "@/features/character-builder/domain/progression/feats";

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

export function progressionFeatSpellKeyPrefix(
  atLevel: ProgressionFeatLevel,
): string {
  return `${progressionSlotKey(atLevel)}:`;
}

export function totalProgressionFeatSpellChoicesRequired(
  progressionFeats: BuilderProgressionFeat[],
  state: CharacterBuilderState,
): number {
  return syncProgressionFeatSlots(state).reduce((sum, slot) => {
    if (slot.kind !== "feat" || !slot.feat_id) return sum;
    const feat = progressionFeats.find((entry) => entry.id === slot.feat_id);
    return sum + totalFeatSpellChoicesRequired(feat?.spellcasting);
  }, 0);
}
