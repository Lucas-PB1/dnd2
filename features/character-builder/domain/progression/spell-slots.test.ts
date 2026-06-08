import { describe, expect, it } from "vitest";
import {
  formatSpellSlotsPreview,
  spellSlotsForClass,
} from "@/features/character-builder/domain/progression/spell-slots";

describe("spellSlotsForClass — Warlock (pact)", () => {
  it("nível 1: 1 slot de 1º", () => {
    expect(spellSlotsForClass("Warlock", 1)).toEqual([{ slotLevel: 1, count: 1 }]);
  });

  it("nível 5: 2 slots de 3º", () => {
    expect(spellSlotsForClass("Warlock", 5)).toEqual([{ slotLevel: 3, count: 2 }]);
    expect(formatSpellSlotsPreview(spellSlotsForClass("Warlock", 5))).toBe("2×3º");
  });

  it("nível 11: 3 slots de 5º", () => {
    expect(spellSlotsForClass("Warlock", 11)).toEqual([{ slotLevel: 5, count: 3 }]);
  });
});

describe("spellSlotsForClass — Paladin (half)", () => {
  it("nível 2: 2 slots de 1º", () => {
    expect(spellSlotsForClass("Paladin", 2)).toEqual([{ slotLevel: 1, count: 2 }]);
  });

  it("nível 5: 4×1º e 2×2º", () => {
    expect(spellSlotsForClass("Paladin", 5)).toEqual([
      { slotLevel: 1, count: 4 },
      { slotLevel: 2, count: 2 },
    ]);
  });

  it("nível 9: inclui slot de 3º", () => {
    expect(spellSlotsForClass("Paladin", 9)).toEqual([
      { slotLevel: 1, count: 4 },
      { slotLevel: 2, count: 3 },
      { slotLevel: 3, count: 2 },
    ]);
  });
});

describe("spellSlotsForClass — Ranger (half)", () => {
  it("nível 5: igual ao Paladino (progressão half)", () => {
    expect(spellSlotsForClass("Ranger", 5)).toEqual(spellSlotsForClass("Paladin", 5));
  });

  it("nível 13: inclui slot de 4º", () => {
    expect(spellSlotsForClass("Ranger", 13)).toEqual([
      { slotLevel: 1, count: 4 },
      { slotLevel: 2, count: 3 },
      { slotLevel: 3, count: 3 },
      { slotLevel: 4, count: 1 },
    ]);
  });
});
