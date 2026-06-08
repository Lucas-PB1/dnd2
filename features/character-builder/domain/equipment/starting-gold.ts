import { clampClassLevel } from "@/features/character-builder/domain/progression/levels";

/** Espelha `starting_gold_tiers` (migration 000043) — PHB 2024. */
export type StartingGoldTier = {
  min_level: number;
  max_level: number;
  base_gp: number;
  bonus_dice_count: number;
  bonus_dice_sides: number;
  bonus_dice_multiplier: number;
  notes: string;
};

export const STARTING_GOLD_TIERS: readonly StartingGoldTier[] = [
  {
    min_level: 1,
    max_level: 1,
    base_gp: 0,
    bonus_dice_count: 0,
    bonus_dice_sides: 0,
    bonus_dice_multiplier: 0,
    notes: "Equipamento normal do antecedente (nível 1).",
  },
  {
    min_level: 2,
    max_level: 4,
    base_gp: 0,
    bonus_dice_count: 0,
    bonus_dice_sides: 0,
    bonus_dice_multiplier: 0,
    notes: "PHB 2024: equipamento normal; itens mágicos comuns fora do escopo v1.",
  },
  {
    min_level: 5,
    max_level: 10,
    base_gp: 500,
    bonus_dice_count: 1,
    bonus_dice_sides: 10,
    bonus_dice_multiplier: 25,
    notes: "PHB 2024: 500 GP + 1d10 × 25 GP + equipamento normal.",
  },
  {
    min_level: 11,
    max_level: 16,
    base_gp: 5000,
    bonus_dice_count: 1,
    bonus_dice_sides: 10,
    bonus_dice_multiplier: 250,
    notes: "PHB 2024: 5.000 GP + 1d10 × 250 GP + equipamento normal.",
  },
  {
    min_level: 17,
    max_level: 20,
    base_gp: 20000,
    bonus_dice_count: 1,
    bonus_dice_sides: 10,
    bonus_dice_multiplier: 250,
    notes: "PHB 2024: 20.000 GP + 1d10 × 250 GP + equipamento normal.",
  },
] as const;

export type StartingGoldRollMode = "base" | "min" | "average" | "max";

function dieTotal(
  tier: StartingGoldTier,
  mode: Exclude<StartingGoldRollMode, "base">,
): number {
  if (tier.bonus_dice_count === 0 || tier.bonus_dice_sides === 0) return 0;

  const perDie =
    mode === "min"
      ? 1
      : mode === "max"
        ? tier.bonus_dice_sides
        : (1 + tier.bonus_dice_sides) / 2;

  return Math.round(
    tier.bonus_dice_count * perDie * tier.bonus_dice_multiplier,
  );
}

export function startingGoldTierForLevel(
  classLevel: number,
): StartingGoldTier | null {
  const level = clampClassLevel(classLevel);
  return (
    STARTING_GOLD_TIERS.find(
      (tier) => level >= tier.min_level && level <= tier.max_level,
    ) ?? null
  );
}

export function startingGoldGpForLevel(
  classLevel: number,
  mode: StartingGoldRollMode = "average",
): number {
  const tier = startingGoldTierForLevel(classLevel);
  if (!tier) return 0;
  if (mode === "base") return tier.base_gp;
  return tier.base_gp + dieTotal(tier, mode);
}

export function startingGoldHasBonus(classLevel: number): boolean {
  const tier = startingGoldTierForLevel(classLevel);
  return (tier?.bonus_dice_count ?? 0) > 0;
}

export function formatStartingGoldFormula(classLevel: number): string | null {
  const tier = startingGoldTierForLevel(classLevel);
  if (!tier) return null;

  if (tier.bonus_dice_count === 0) {
    return tier.min_level === 1
      ? "Equipamento do antecedente"
      : "Sem ouro extra (equipamento normal)";
  }

  return `${tier.base_gp.toLocaleString("pt-BR")} PO + 1d10×${tier.bonus_dice_multiplier} PO`;
}

export function formatStartingGoldPreview(classLevel: number): string | null {
  const tier = startingGoldTierForLevel(classLevel);
  if (!tier) return null;

  if (tier.bonus_dice_count === 0) {
    return formatStartingGoldFormula(classLevel);
  }

  const average = startingGoldGpForLevel(classLevel, "average");
  const min = startingGoldGpForLevel(classLevel, "min");
  const max = startingGoldGpForLevel(classLevel, "max");

  return `${formatStartingGoldFormula(classLevel)} (≈${average.toLocaleString("pt-BR")} PO; ${min.toLocaleString("pt-BR")}–${max.toLocaleString("pt-BR")})`;
}
