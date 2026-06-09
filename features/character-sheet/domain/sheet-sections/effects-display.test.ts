import { describe, expect, it } from "vitest";
import {
  formatActiveEffects,
  formatEffectDetails,
} from "@/features/character-sheet/domain/sheet-sections/effects-display";
import type { CharacterActiveEffect } from "@/features/character-sheet/types/character.types";

const SAMPLE_EFFECT: CharacterActiveEffect = {
  source_type: "feat",
  source_name: "Tough",
  trait_name: null,
  effect_name: "Tough",
  is_active: true,
  duration_text: null,
  modifiers: [{ affected_stat: "max_hp", operation: "add", modifier_value: 10 }],
  damage_adjustments: [
    { damage_type: "Fire", adjustment_type: "resistance", scope_text: null },
    { damage_type: "Cold", adjustment_type: "immunity", scope_text: "while raging" },
  ],
  statuses: [{ status: "Blessed", duration_text: "1 minute", scope_text: null }],
  condition_adjustments: [
    { status: "Frightened", adjustment_type: "immunity", scope_text: null },
  ],
  proficiencies: [{ name: "Elvish", proficiency_type: "language" }],
};

describe("effects-display", () => {
  it("formata JSON de efeitos em strings pt-BR legíveis", () => {
    const lines = formatEffectDetails(SAMPLE_EFFECT);

    expect(lines).toContainEqual({
      kind: "modifier",
      text: "max_hp: +10",
    });
    expect(lines).toContainEqual({
      kind: "damage",
      text: "Resistência a Fire",
    });
    expect(lines).toContainEqual({
      kind: "damage",
      text: "Imunidade a Cold (while raging)",
    });
    expect(lines).toContainEqual({
      kind: "status",
      text: "Blessed · 1 minute",
    });
    expect(lines).toContainEqual({
      kind: "condition",
      text: "Imunidade a Frightened",
    });
    expect(lines).toContainEqual({
      kind: "proficiency",
      text: "Elvish (idioma)",
    });
  });

  it("formata proficiência com escolha e notas (ex.: Humano Skillful)", () => {
    const effect: CharacterActiveEffect = {
      source_type: "species",
      source_name: "Human",
      trait_name: "Skillful",
      effect_name: "Skillful",
      is_active: true,
      duration_text: null,
      modifiers: [],
      damage_adjustments: [],
      statuses: [],
      condition_adjustments: [],
      proficiencies: [
        {
          name: null,
          tool: null,
          notes: "Choose one skill proficiency.",
          skill: null,
          language: null,
          choice_count: 1,
          tool_category: null,
          proficiency_type: "skill",
          requires_choice: true,
        },
      ],
    };

    const lines = formatEffectDetails(effect);

    expect(lines).toEqual([
      {
        kind: "proficiency",
        text: "Choose one skill proficiency.",
      },
    ]);
  });

  it("ignora efeitos inativos", () => {
    const formatted = formatActiveEffects([
      { ...SAMPLE_EFFECT, is_active: false },
      SAMPLE_EFFECT,
    ]);

    expect(formatted).toHaveLength(1);
    expect(formatted[0]?.effect.effect_name).toBe("Tough");
  });
});
