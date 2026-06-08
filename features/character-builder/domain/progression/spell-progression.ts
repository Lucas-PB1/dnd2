import { clampClassLevel } from "@/features/character-builder/domain/progression/levels";

/** PHB 2024: 6 magias Lv1 no 1º nível; +2 ao grimório a cada nível de Mago. */
export const WIZARD_SPELLBOOK_LEVEL1_COUNT = 6;
export const WIZARD_SPELLBOOK_PER_LEVEL_AFTER_FIRST = 2;

export type SpellcastingProgression = "full" | "half" | "pact" | "none";

export function wizardSpellbookCount(classLevel: number): number {
  const level = clampClassLevel(classLevel);
  if (level <= 1) return WIZARD_SPELLBOOK_LEVEL1_COUNT;
  return (
    WIZARD_SPELLBOOK_LEVEL1_COUNT +
    (level - 1) * WIZARD_SPELLBOOK_PER_LEVEL_AFTER_FIRST
  );
}

export function spellcastingProgressionForClass(
  className: string,
): SpellcastingProgression {
  switch (className) {
    case "Paladin":
    case "Ranger":
      return "half";
    case "Warlock":
      return "pact";
    case "Bard":
    case "Cleric":
    case "Druid":
    case "Sorcerer":
    case "Wizard":
      return "full";
    default:
      return "none";
  }
}

/** Maior nível de slot de magia disponível neste nível de classe. */
export function maxSpellSlotLevel(
  classLevel: number,
  progression: SpellcastingProgression,
): number {
  const level = clampClassLevel(classLevel);
  if (progression === "none") return 0;

  if (progression === "pact") {
    if (level >= 17) return 5;
    if (level >= 9) return 5;
    if (level >= 7) return 4;
    if (level >= 5) return 3;
    if (level >= 3) return 2;
    return 1;
  }

  const effectiveLevel =
    progression === "half" ? Math.max(1, Math.ceil(level / 2)) : level;

  if (effectiveLevel >= 17) return 9;
  if (effectiveLevel >= 15) return 8;
  if (effectiveLevel >= 13) return 7;
  if (effectiveLevel >= 11) return 6;
  if (effectiveLevel >= 9) return 5;
  if (effectiveLevel >= 7) return 4;
  if (effectiveLevel >= 5) return 3;
  if (effectiveLevel >= 3) return 2;
  return 1;
}
