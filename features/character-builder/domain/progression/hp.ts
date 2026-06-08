import { hitDieMax } from "@/features/character-builder/domain/abilities/abilities";
import { clampClassLevel } from "@/features/character-builder/domain/progression/levels";

export type HpMode = "max" | "average";

export function computeMaxHp(
  hitDie: string,
  constitutionModifier: number,
  level: number,
  mode: HpMode = "max",
): number {
  const clampedLevel = clampClassLevel(level);
  const die = hitDieMax(hitDie);
  const first = Math.max(1, die + constitutionModifier);

  if (clampedLevel <= 1) return first;

  if (mode === "max") {
    const perLevel = Math.max(1, die + constitutionModifier);
    return first + (clampedLevel - 1) * perLevel;
  }

  const averagePerLevel = Math.max(1, Math.floor(die / 2) + 1 + constitutionModifier);
  return first + (clampedLevel - 1) * averagePerLevel;
}

/** @deprecated Use computeMaxHp(..., 1, mode). */
export function computeLevel1Hp(hitDie: string, constitution: number): number {
  return computeMaxHp(hitDie, constitution, 1, "max");
}
