import { sortInventory } from "@/features/character-sheet/domain/sheet-display";
import type { CharacterInventoryItem } from "@/shared/character";

export const MAX_ATTUNEMENT = 3;

export type InventoryPartition = {
  key: "equipped" | "carried";
  label: string;
  items: CharacterInventoryItem[];
};

export type AttunementSummary = {
  attuned: number;
  max: number;
  atLimit: boolean;
};

export function attunementSummary(
  inventory: CharacterInventoryItem[],
): AttunementSummary {
  const attuned = inventory.filter((item) => item.is_attuned).length;
  return {
    attuned,
    max: MAX_ATTUNEMENT,
    atLimit: attuned >= MAX_ATTUNEMENT,
  };
}

export function partitionInventory(
  inventory: CharacterInventoryItem[],
): InventoryPartition[] {
  const sorted = sortInventory(inventory);
  const equipped = sorted.filter((item) => item.is_equipped);
  const carried = sorted.filter((item) => !item.is_equipped);

  const partitions: InventoryPartition[] = [];
  if (equipped.length > 0) {
    partitions.push({ key: "equipped", label: "Equipado", items: equipped });
  }
  if (carried.length > 0) {
    partitions.push({ key: "carried", label: "Carregado", items: carried });
  }
  return partitions;
}
