import { describe, expect, it } from "vitest";
import {
  formatStartingGoldFormula,
  startingGoldGpForLevel,
  startingGoldTierForLevel,
} from "@/features/character-builder/domain/equipment/starting-gold";

describe("startingGoldGpForLevel", () => {
  it("nível 1 não concede ouro extra além do antecedente", () => {
    expect(startingGoldGpForLevel(1)).toBe(0);
  });

  it("nível 5 usa faixa PHB 500 + 1d10×25 (média)", () => {
    expect(startingGoldGpForLevel(5, "base")).toBe(500);
    expect(startingGoldGpForLevel(5, "min")).toBe(525);
    expect(startingGoldGpForLevel(5, "max")).toBe(750);
    expect(startingGoldGpForLevel(5, "average")).toBe(638);
  });

  it("nível 20 usa faixa PHB 20.000 + 1d10×250", () => {
    const tier = startingGoldTierForLevel(20);
    expect(tier?.base_gp).toBe(20000);
    expect(startingGoldGpForLevel(20, "min")).toBe(20250);
  });

  it("expõe fórmula legível", () => {
    expect(formatStartingGoldFormula(8)).toBe("500 PO + 1d10×25 PO");
  });
});
