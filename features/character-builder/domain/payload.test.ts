import { describe, expect, it } from "vitest";
import { toCreateCharacterRpcBody } from "@/features/character-builder/domain/payload";
import type { CreateCharacterBuilderPayload } from "@/features/character-builder/types/builder.types";

describe("toCreateCharacterRpcBody", () => {
  it("repassa class_level e subclass_id em classes[]", () => {
    const payload: CreateCharacterBuilderPayload = {
      name: "Teste",
      class_id: 7,
      class_level: 12,
      subclass_id: 3,
      species_id: 1,
      background_id: 2,
      size: "Medium",
      abilities: {
        STR: 10,
        DEX: 14,
        CON: 12,
        INT: 16,
        WIS: 10,
        CHA: 8,
      },
      max_hp: 99,
      class_skill_ids: [1],
      proficiencies: [],
      trait_options: [],
      feats: [],
      inventory: [],
      spells: [],
      trait_spell_choices: [],
    };

    const body = toCreateCharacterRpcBody(payload);

    expect(body.classes).toEqual([
      {
        class_id: 7,
        class_level: 12,
        subclass_id: 3,
      },
    ]);
    expect(body.max_hp).toBe(99);
    expect(body.current_hp).toBe(99);
  });
});
