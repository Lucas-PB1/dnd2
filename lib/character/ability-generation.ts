import type { AbilityKey, AbilityAssignment } from "@/features/character/types/builder.types";
import { ABILITY_KEYS, STANDARD_ARRAY } from "@/features/character/types/builder.types";

export const POINT_BUY_TOTAL = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;

export const ROLL_MIN_TOTAL = 72;
export const ROLL_MAX_TOTAL = 80;
export const MAX_ROLL_ATTEMPTS = 3;

const POINT_BUY_COST: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export function pointBuyCost(score: number): number {
  return POINT_BUY_COST[score] ?? 0;
}

export function pointBuySpent(assignment: AbilityAssignment): number {
  return ABILITY_KEYS.reduce(
    (sum, key) => sum + pointBuyCost(assignment[key] ?? POINT_BUY_MIN),
    0,
  );
}

export function pointBuyRemaining(assignment: AbilityAssignment): number {
  return POINT_BUY_TOTAL - pointBuySpent(assignment);
}

export function emptyPointBuyAssignment(): AbilityAssignment {
  return {
    STR: POINT_BUY_MIN,
    DEX: POINT_BUY_MIN,
    CON: POINT_BUY_MIN,
    INT: POINT_BUY_MIN,
    WIS: POINT_BUY_MIN,
    CHA: POINT_BUY_MIN,
  };
}

export function roll4d6DropLowest(): number {
  const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  rolls.sort((a, b) => a - b);
  return rolls.slice(1).reduce((sum, value) => sum + value, 0);
}

export function rollAbilitySet(): number[] {
  return ABILITY_KEYS.map(() => roll4d6DropLowest());
}

export function rollSetTotal(scores: number[]): number {
  return scores.reduce((sum, value) => sum + value, 0);
}

export function isRollSetValid(scores: number[]): boolean {
  if (scores.length !== 6) return false;
  const total = rollSetTotal(scores);
  return total >= ROLL_MIN_TOTAL && total <= ROLL_MAX_TOTAL;
}

function multisetEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((value, index) => value === sortedB[index]);
}

export function isStandardArrayComplete(assignment: AbilityAssignment): boolean {
  const values = ABILITY_KEYS.map((key) => assignment[key]).filter(
    (value): value is number => value !== null,
  );

  if (values.length !== 6) return false;

  const sorted = [...values].sort((a, b) => b - a);
  const expected = [...STANDARD_ARRAY].sort((a, b) => b - a);
  return sorted.every((value, index) => value === expected[index]);
}

export function isPointBuyComplete(assignment: AbilityAssignment): boolean {
  for (const key of ABILITY_KEYS) {
    const score = assignment[key];
    if (score === null || score < POINT_BUY_MIN || score > POINT_BUY_MAX) {
      return false;
    }
  }
  return pointBuySpent(assignment) === POINT_BUY_TOTAL;
}

export function isRollAssignmentComplete(
  assignment: AbilityAssignment,
  selectedSet: number[] | null,
): boolean {
  if (!selectedSet || !isRollSetValid(selectedSet)) return false;

  const values = ABILITY_KEYS.map((key) => assignment[key]).filter(
    (value): value is number => value !== null,
  );

  if (values.length !== 6) return false;
  return multisetEqual(values, selectedSet);
}

export function isAbilityBaseComplete(
  method: "standard" | "point_buy" | "roll",
  assignment: AbilityAssignment,
  selectedRollSet: number[] | null,
): boolean {
  switch (method) {
    case "standard":
      return isStandardArrayComplete(assignment);
    case "point_buy":
      return isPointBuyComplete(assignment);
    case "roll":
      return isRollAssignmentComplete(assignment, selectedRollSet);
    default:
      return false;
  }
}

export function adjustPointBuyScore(
  assignment: AbilityAssignment,
  ability: AbilityKey,
  delta: number,
): AbilityAssignment | null {
  const current = assignment[ability] ?? POINT_BUY_MIN;
  const nextScore = current + delta;
  if (nextScore < POINT_BUY_MIN || nextScore > POINT_BUY_MAX) return null;

  const next = { ...assignment, [ability]: nextScore };
  if (pointBuySpent(next) > POINT_BUY_TOTAL) return null;
  return next;
}
