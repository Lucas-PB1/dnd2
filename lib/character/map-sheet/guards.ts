import type { CharacterAbilityKey } from "@/shared/character";

const ABILITY_LABELS: Record<CharacterAbilityKey, string> = {
  STR: "Força",
  DEX: "Destreza",
  CON: "Constituição",
  INT: "Inteligência",
  WIS: "Sabedoria",
  CHA: "Carisma",
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function asOptionalNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
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

export function abilityLabel(ability: CharacterAbilityKey): string {
  return ABILITY_LABELS[ability];
}

export function mapArray<T>(
  value: unknown,
  mapper: (entry: unknown) => T | null,
): T[] {
  return asArray(value).flatMap((entry) => {
    const mapped = mapper(entry);
    return mapped ? [mapped] : [];
  });
}
