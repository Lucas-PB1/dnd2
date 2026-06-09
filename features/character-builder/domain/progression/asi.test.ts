import { describe, expect, it } from "vitest";
import { applyAsiTraitOptions } from "@/features/character-builder/domain/progression/asi";
import type {
  AbilityKey,
  BuilderOriginFeatChoice,
  TraitOptionSelection,
} from "@/features/character-builder/types/builder.types";

const BASE_ABILITIES: Record<AbilityKey, number> = {
  STR: 15,
  DEX: 14,
  CON: 13,
  INT: 12,
  WIS: 10,
  CHA: 8,
};

function asiGroups(): BuilderOriginFeatChoice[] {
  return [
    {
      trait_id: 1,
      trait_name: "Ability Score Improvement",
      trait_description: null,
      option_group: "Primary Ability Score",
      choice_count: 1,
      is_required: true,
      options: [
        {
          trait_option_id: 101,
          name: "Strength",
          description: null,
          option_group: "Primary Ability Score",
          modifiers: [
            {
              choice_mode_key: "plus_two_plus_one",
              affected_stat: "strength",
              operation: "add",
              modifier_value: 2,
              max_value: 20,
            },
            {
              choice_mode_key: "triple_plus_one",
              affected_stat: "strength",
              operation: "add",
              modifier_value: 1,
              max_value: 20,
            },
          ],
        },
      ],
    },
    {
      trait_id: 1,
      trait_name: "Ability Score Improvement",
      trait_description: null,
      option_group: "Secondary Ability Score",
      choice_count: 1,
      is_required: true,
      options: [
        {
          trait_option_id: 102,
          name: "Constitution",
          description: null,
          option_group: "Secondary Ability Score",
          modifiers: [
            {
              choice_mode_key: "plus_two_plus_one",
              affected_stat: "constitution",
              operation: "add",
              modifier_value: 1,
              max_value: 20,
            },
            {
              choice_mode_key: "triple_plus_one",
              affected_stat: "constitution",
              operation: "add",
              modifier_value: 1,
              max_value: 20,
            },
          ],
        },
      ],
    },
    {
      trait_id: 1,
      trait_name: "Ability Score Improvement",
      trait_description: null,
      option_group: "Tertiary Ability Score",
      choice_count: 1,
      is_required: false,
      options: [
        {
          trait_option_id: 103,
          name: "Wisdom",
          description: null,
          option_group: "Tertiary Ability Score",
          modifiers: [
            {
              choice_mode_key: "triple_plus_one",
              affected_stat: "wisdom",
              operation: "add",
              modifier_value: 1,
              max_value: 20,
            },
          ],
        },
      ],
    },
  ];
}

function selection(
  option_group: string,
  trait_option_id: number,
): TraitOptionSelection {
  return {
    trait_id: 1,
    option_group,
    selection_key: `${option_group}:0`,
    trait_option_id,
  };
}

describe("applyAsiTraitOptions", () => {
  it("aplica ASI +2/+1 quando o grupo terciário opcional fica vazio", () => {
    const result = applyAsiTraitOptions(
      BASE_ABILITIES,
      [
        selection("Primary Ability Score", 101),
        selection("Secondary Ability Score", 102),
      ],
      asiGroups(),
    );

    expect(result.STR).toBe(17);
    expect(result.CON).toBe(14);
    expect(result.WIS).toBe(10);
  });

  it("aplica ASI +1/+1/+1 quando o grupo terciário é escolhido", () => {
    const result = applyAsiTraitOptions(
      BASE_ABILITIES,
      [
        selection("Primary Ability Score", 101),
        selection("Secondary Ability Score", 102),
        selection("Tertiary Ability Score", 103),
      ],
      asiGroups(),
    );

    expect(result.STR).toBe(16);
    expect(result.CON).toBe(14);
    expect(result.WIS).toBe(11);
  });

  it("usa max_value do catálogo para Epic Boon acima de 20", () => {
    const result = applyAsiTraitOptions(
      { ...BASE_ABILITIES, STR: 20 },
      [
        {
          trait_id: 2,
          option_group: "Ability Score",
          selection_key: "Ability Score:0",
          trait_option_id: 201,
        },
      ],
      [
        {
          trait_id: 2,
          trait_name: "Boon of Fortitude: Ability Score Increase",
          trait_description: null,
          option_group: "Ability Score",
          choice_count: 1,
          is_required: true,
          options: [
            {
              trait_option_id: 201,
              name: "Strength",
              description: null,
              option_group: "Ability Score",
              modifiers: [
                {
                  choice_mode_key: null,
                  affected_stat: "strength",
                  operation: "add",
                  modifier_value: 1,
                  max_value: 30,
                },
              ],
            },
          ],
        },
      ],
    );

    expect(result.STR).toBe(21);
  });
});
