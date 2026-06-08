export const MIN_CLASS_LEVEL = 1;
export const MAX_CLASS_LEVEL = 20;

export const FEAT_CHOICE_LEVELS = [4, 8, 12, 16, 19] as const;

export const SUBCLASS_UNLOCK_LEVEL = 3;

export type SubclassUnlockSource = {
  unlock_level?: number | null;
};

export function clampClassLevel(level: number): number {
  if (!Number.isFinite(level)) return MIN_CLASS_LEVEL;
  return Math.min(MAX_CLASS_LEVEL, Math.max(MIN_CLASS_LEVEL, Math.round(level)));
}

export function subclassUnlockLevel(
  subclasses: SubclassUnlockSource[],
): number {
  if (subclasses.length === 0) return SUBCLASS_UNLOCK_LEVEL;
  return Math.min(
    ...subclasses.map((sub) => sub.unlock_level ?? SUBCLASS_UNLOCK_LEVEL),
  );
}

export function requiresSubclassSelection(
  classLevel: number,
  subclasses: SubclassUnlockSource[],
): boolean {
  if (subclasses.length === 0) return false;
  return clampClassLevel(classLevel) >= subclassUnlockLevel(subclasses);
}

/** @deprecated Prefira `requiresSubclassSelection` com subclasses da classe. */
export function requiresSubclass(
  classLevel: number,
  unlockLevel: number = SUBCLASS_UNLOCK_LEVEL,
): boolean {
  return clampClassLevel(classLevel) >= unlockLevel;
}

/** Bônus de proficiência SRD (nível de personagem). */
export function proficiencyBonusForLevel(level: number): number {
  const clamped = clampClassLevel(level);
  return Math.floor((clamped - 1) / 4) + 2;
}

export function featChoicesRequired(classLevel: number): number {
  return FEAT_CHOICE_LEVELS.filter((level) => level <= clampClassLevel(classLevel))
    .length;
}
