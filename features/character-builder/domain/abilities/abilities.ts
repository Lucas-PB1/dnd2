import type {
  AbilityKey,
  BackgroundAsiSelection,
  AbilityAssignment,
  RollSlotAssignment,
} from "@/features/character-builder/types/builder.types";
import { ABILITY_KEYS } from "@/features/character-builder/types/builder.types";
import {
  isAbilityBaseComplete,
  isStandardArrayComplete,
} from "@/features/character-builder/domain/abilities/ability-generation";

export {
  isStandardArrayComplete,
  isAbilityBaseComplete,
  isPointBuyComplete,
  isRollSetValid,
  rollAbilitySet,
  rollSetTotal,
  pointBuyRemaining,
  pointBuySpent,
  emptyPointBuyAssignment,
  adjustPointBuyScore,
  POINT_BUY_TOTAL,
  ROLL_MIN_TOTAL,
  ROLL_MAX_TOTAL,
  MAX_ROLL_ATTEMPTS,
} from "@/features/character-builder/domain/abilities/ability-generation";

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function emptyAbilityAssignment(): AbilityAssignment {
  return {
    STR: null,
    DEX: null,
    CON: null,
    INT: null,
    WIS: null,
    CHA: null,
  };
}

export function emptyRollSlotAssignment(): RollSlotAssignment {
  return {
    STR: null,
    DEX: null,
    CON: null,
    INT: null,
    WIS: null,
    CHA: null,
  };
}

export function applyBackgroundAsi(
  base: AbilityAssignment,
  backgroundOptions: AbilityKey[],
  asi: BackgroundAsiSelection,
): Record<AbilityKey, number> {
  const result = {} as Record<AbilityKey, number>;

  for (const key of ABILITY_KEYS) {
    result[key] = base[key] ?? 10;
  }

  const allowed = new Set(backgroundOptions);

  if (asi.mode === "even") {
    for (const key of backgroundOptions) {
      if (allowed.has(key)) {
        result[key] += 1;
      }
    }
    return result;
  }

  if (asi.plus2 && allowed.has(asi.plus2)) {
    result[asi.plus2] += 2;
  }
  if (asi.plus1 && allowed.has(asi.plus1) && asi.plus1 !== asi.plus2) {
    result[asi.plus1] += 1;
  }

  return result;
}

export function hitDieMax(hitDie: string): number {
  const map: Record<string, number> = { d6: 6, d8: 8, d10: 10, d12: 12 };
  return map[hitDie] ?? 8;
}

export function computeLevel1Hp(hitDie: string, constitution: number): number {
  return Math.max(1, hitDieMax(hitDie) + abilityModifier(constitution));
}

export function parseSizeOptions(sizeOptions: string): string[] {
  return sizeOptions.split(/\s+or\s+/i).map((part) => part.trim()).filter(Boolean);
}

export function isBaseAbilitiesComplete(
  method: "standard" | "point_buy" | "roll",
  assignment: AbilityAssignment,
  selectedRollSet: number[] | null,
): boolean {
  return isAbilityBaseComplete(method, assignment, selectedRollSet);
}
