import type { CharacterAbilityKey } from "@/shared/character";

export function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function asAbilityKey(value: unknown): CharacterAbilityKey | null {
  if (
    value === "STR" ||
    value === "DEX" ||
    value === "CON" ||
    value === "INT" ||
    value === "WIS" ||
    value === "CHA"
  ) {
    return value;
  }
  return null;
}
