import type { TraitOptionSelection } from "@/features/character/types/builder.types";
import { ABILITY_KEYS } from "@/features/character/types/builder.types";

export function selectionKey(group: string, index: number): string {
  return `${group}:${index}`;
}

export function toggleIdList(list: number[], id: number, max: number): number[] {
  if (list.includes(id)) {
    return list.filter((value) => value !== id);
  }
  if (list.length >= max) {
    return list;
  }
  return [...list, id];
}

export function toggleTraitOption(
  list: TraitOptionSelection[],
  next: TraitOptionSelection,
  max: number,
): TraitOptionSelection[] {
  const filtered = list.filter(
    (entry) =>
      !(
        entry.trait_id === next.trait_id &&
        entry.option_group === next.option_group &&
        entry.selection_key === next.selection_key
      ),
  );

  const sameGroup = list.filter(
    (entry) =>
      entry.trait_id === next.trait_id &&
      entry.option_group === next.option_group,
  );

  const alreadySelected = list.some(
    (entry) =>
      entry.trait_id === next.trait_id &&
      entry.option_group === next.option_group &&
      entry.trait_option_id === next.trait_option_id,
  );

  if (alreadySelected) {
    return filtered;
  }

  if (sameGroup.length >= max) {
    return list;
  }

  return [...filtered, next];
}

export { ABILITY_KEYS };
