import { clampClassLevel } from "@/features/character-builder/domain/progression/levels";

/** Faixas DMG simplificadas para itens mágicos na loja de campanha. */
export const MAGIC_ITEM_LEVEL_BANDS = [
  { minLevel: 1, maxLevel: 4, label: "Comum", maxCostGp: 100 },
  { minLevel: 5, maxLevel: 10, label: "Incomum", maxCostGp: 500 },
  { minLevel: 11, maxLevel: 16, label: "Raro", maxCostGp: 5_000 },
  { minLevel: 17, maxLevel: 20, label: "Muito raro", maxCostGp: 50_000 },
] as const;

export function magicItemsAllowedAtLevel(characterLevel: number): boolean {
  return clampClassLevel(characterLevel) >= 5;
}

export function maxMagicItemCostGp(characterLevel: number): number {
  const level = clampClassLevel(characterLevel);
  const band = MAGIC_ITEM_LEVEL_BANDS.find(
    (entry) => level >= entry.minLevel && level <= entry.maxLevel,
  );
  return band?.maxCostGp ?? 0;
}

export function magicItemBandLabel(characterLevel: number): string | null {
  const level = clampClassLevel(characterLevel);
  const band = MAGIC_ITEM_LEVEL_BANDS.find(
    (entry) => level >= entry.minLevel && level <= entry.maxLevel,
  );
  return band?.label ?? null;
}
