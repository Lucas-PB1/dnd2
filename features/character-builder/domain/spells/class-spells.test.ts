import { describe, expect, it } from "vitest";
import {
  maxSpellSlotLevel,
  spellcastingProgressionForClass,
  wizardSpellbookCount,
} from "@/features/character-builder/domain/progression/spell-progression";
import {
  spellKnowledgeCount,
  totalSpellChoicesRequired,
} from "@/features/character-builder/domain/spells/class-spells";
import type { BuilderClassSpellcasting } from "@/features/character-builder/types/builder.types";

describe("spell counts @ nível 5 (full caster)", () => {
  const level5Knowledge = new Map<string, number>([
    ["wizard", 4],
    ["wizard-prepared", 9],
  ]);

  it("usa contagens de spell_knowledge_by_level quando disponíveis", () => {
    expect(spellKnowledgeCount("wizard", 5, level5Knowledge)).toBe(4);
    expect(spellKnowledgeCount("wizard-prepared", 5, level5Knowledge)).toBe(9);
  });

  it("calcula grimório do Mago @ nível 5", () => {
    expect(wizardSpellbookCount(5)).toBe(14);
  });

  it("calcula slot máximo @ nível 5 para full caster", () => {
    expect(
      maxSpellSlotLevel(5, spellcastingProgressionForClass("Wizard")),
    ).toBe(3);
  });

  it("soma truques + preparadas + grimório no total de escolhas", () => {
    const spellcasting: BuilderClassSpellcasting = {
      spellcasting_ability: "INT",
      cantrip_count: 4,
      prepared_count: 9,
      spellbook_count: 14,
      uses_spellbook: true,
      max_spell_level: 3,
      spells: [],
    };

    expect(totalSpellChoicesRequired(spellcasting)).toBe(27);
  });
});
