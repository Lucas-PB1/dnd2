import { describe, expect, it } from "vitest";
import {
  featChoicesRequired,
  proficiencyBonusForLevel,
  requiresSubclassSelection,
  subclassUnlockLevel,
  SUBCLASS_UNLOCK_LEVEL,
} from "@/features/character-builder/domain/progression/levels";

describe("subclass unlock level", () => {
  it("usa constante global quando não há subclasses", () => {
    expect(subclassUnlockLevel([])).toBe(SUBCLASS_UNLOCK_LEVEL);
  });

  it("respeita unlock_level da subclasse no banco", () => {
    expect(
      requiresSubclassSelection(2, [{ unlock_level: 3 }, { unlock_level: 3 }]),
    ).toBe(false);
    expect(
      requiresSubclassSelection(3, [{ unlock_level: 3 }, { unlock_level: 5 }]),
    ).toBe(true);
    expect(subclassUnlockLevel([{ unlock_level: 5 }])).toBe(5);
  });
});

describe("featChoicesRequired", () => {
  it("retorna 0 abaixo do nível 4", () => {
    expect(featChoicesRequired(1)).toBe(0);
    expect(featChoicesRequired(3)).toBe(0);
  });

  it("acumula slots nos níveis 4, 8, 12, 16 e 19", () => {
    expect(featChoicesRequired(4)).toBe(1);
    expect(featChoicesRequired(8)).toBe(2);
    expect(featChoicesRequired(12)).toBe(3);
    expect(featChoicesRequired(16)).toBe(4);
    expect(featChoicesRequired(19)).toBe(5);
    expect(featChoicesRequired(20)).toBe(5);
  });
});

describe("proficiencyBonusForLevel", () => {
  it("segue tabela SRD 1–20", () => {
    const table: Record<number, number> = {
      1: 2, 2: 2, 3: 2, 4: 2,
      5: 3, 6: 3, 7: 3, 8: 3,
      9: 4, 10: 4, 11: 4, 12: 4,
      13: 5, 14: 5, 15: 5, 16: 5,
      17: 6, 18: 6, 19: 6, 20: 6,
    };

    for (let level = 1; level <= 20; level += 1) {
      expect(proficiencyBonusForLevel(level)).toBe(table[level]);
    }
  });
});
