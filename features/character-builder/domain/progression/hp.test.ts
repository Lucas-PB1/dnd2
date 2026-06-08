import { describe, expect, it } from "vitest";
import { computeMaxHp } from "@/features/character-builder/domain/progression/hp";

describe("computeMaxHp", () => {
  const hitDie = "d8";
  const conMod = 2;

  it("calcula PV no nível 1 (dado + CON)", () => {
    expect(computeMaxHp(hitDie, conMod, 1)).toBe(10);
  });

  it("calcula PV no nível 5 (máximo por nível)", () => {
    expect(computeMaxHp(hitDie, conMod, 5)).toBe(50);
  });

  it("calcula PV no nível 20 (máximo por nível)", () => {
    expect(computeMaxHp(hitDie, conMod, 20)).toBe(200);
  });
});
