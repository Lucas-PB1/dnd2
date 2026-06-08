import { clampClassLevel } from "@/features/character-builder/domain/progression/levels";

/** Chaves alinhadas ao seed `trait_resources.resource_key`. */
export type ClassResourceKey =
  | "feature-barbarian-rage"
  | "feature-fighter-second-wind"
  | "feature-cleric-channel-divinity"
  | "feature-paladin-channel-divinity"
  | "feature-monk-focus-points";

const BY_LEVEL_PROGRESSIONS: Record<ClassResourceKey, Record<number, number>> = {
  "feature-barbarian-rage": {
    1: 2, 2: 2, 3: 3, 4: 3, 5: 3, 6: 4, 7: 4, 8: 4, 9: 4, 10: 4,
    11: 4, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 6, 18: 6, 19: 6, 20: 6,
  },
  "feature-fighter-second-wind": {
    1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4,
  },
  "feature-cleric-channel-divinity": {
    2: 2, 3: 2, 4: 2, 5: 2, 6: 3, 7: 3, 8: 3, 9: 3, 10: 3,
    11: 3, 12: 3, 13: 3, 14: 3, 15: 3, 16: 3, 17: 3, 18: 4, 19: 4, 20: 4,
  },
  "feature-paladin-channel-divinity": {
    3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2,
    11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2,
  },
  "feature-monk-focus-points": Object.fromEntries(
    Array.from({ length: 20 }, (_, index) => {
      const level = index + 1;
      return [level, level === 1 ? 0 : level];
    }),
  ) as Record<number, number>,
};

/** Espelha `private.trait_resource_max_uses` para recursos `by_level` do SRD. */
export function expectedResourceMaxUses(
  resourceKey: ClassResourceKey,
  classLevel: number,
): number {
  const level = clampClassLevel(classLevel);
  const table = BY_LEVEL_PROGRESSIONS[resourceKey];
  return table[level] ?? table[1] ?? 0;
}

export const POST_CREATION_RESOURCE_CHECKS: {
  label: string;
  resourceKey: ClassResourceKey;
  classLevel: number;
}[] = [
  { label: "Rage (Barbarian 3)", resourceKey: "feature-barbarian-rage", classLevel: 3 },
  { label: "Second Wind (Fighter 5)", resourceKey: "feature-fighter-second-wind", classLevel: 5 },
  { label: "Channel Divinity (Cleric 5)", resourceKey: "feature-cleric-channel-divinity", classLevel: 5 },
  { label: "Focus Points (Monk 5)", resourceKey: "feature-monk-focus-points", classLevel: 5 },
];
