import { describe, expect, it } from "vitest";
import {
  buildClassesRpcPayload,
  maxSecondaryClassLevel,
  totalCharacterLevel,
  validateMulticlassSplit,
} from "@/features/character-builder/domain/multiclass/multiclass";
import type {
  CharacterBuilderState,
  BuilderClassEntry,
} from "@/features/character-builder/types/builder.types";

function state(
  patch: Partial<CharacterBuilderState> = {},
): CharacterBuilderState {
  return {
    step: 3,
    ability_method: "standard",
    ability_assignment: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    roll_slot_assignment: { STR: null, DEX: null, CON: null, INT: null, WIS: null, CHA: null },
    roll_sets: [],
    selected_roll_index: null,
    species_id: 1,
    background_id: 1,
    background_asi: { mode: "split", plus2: null, plus1: null },
    class_id: 10,
    class_level: 5,
    subclass_id: 100,
    secondary_class: null,
    class_skill_ids: [],
    class_tool_selections: [],
    background_tool_selections: [],
    species_trait_options: [],
    origin_feat_trait_options: [],
    human_origin_feat_id: null,
    human_origin_feat_trait_options: [],
    equipment_mode: "background",
    equipment_option_key: "A",
    shop_purchases: [],
    cantrip_spell_ids: [],
    spellbook_spell_ids: [],
    prepared_spell_ids: [],
    expertise_by_trait: {},
    class_trait_option_selections: [],
    progression_feat_slots: [],
    progression_feat_trait_options: [],
    feat_spell_selections: [],
    size: "Medium",
    name: "Test",
    ...patch,
  };
}

const classes: BuilderClassEntry[] = [
  {
    id: 10,
    name: "Fighter",
    hit_die: "d10",
    saving_throws: ["STR", "CON"],
    weapons: [],
    armor: [],
    skill_choices: [],
    tool_choices: [],
    spellcasting: null,
    expertise_choices: [],
    optional_feature_groups: [],
    features: [],
    subclasses: [{ id: 100, name: "Champion", description: null, unlock_level: 3, features: [] }],
  },
  {
    id: 20,
    name: "Wizard",
    hit_die: "d6",
    saving_throws: ["INT", "WIS"],
    weapons: [],
    armor: [],
    skill_choices: [],
    tool_choices: [],
    spellcasting: null,
    expertise_choices: [],
    optional_feature_groups: [],
    features: [],
    subclasses: [{ id: 200, name: "Evoker", description: null, unlock_level: 3, features: [] }],
  },
];

describe("multiclass", () => {
  it("calcula nível total", () => {
    expect(totalCharacterLevel(state())).toBe(5);
    expect(
      totalCharacterLevel(
        state({ secondary_class: { class_id: 20, class_level: 3, subclass_id: null } }),
      ),
    ).toBe(8);
  });

  it("monta classes[] com principal e secundária", () => {
    const payload = buildClassesRpcPayload(
      state({ secondary_class: { class_id: 20, class_level: 3, subclass_id: 200 } }),
    );

    expect(payload).toEqual([
      { class_id: 10, class_level: 5, subclass_id: 100 },
      { class_id: 20, class_level: 3, subclass_id: 200 },
    ]);
  });

  it("rejeita nível total acima de 20", () => {
    expect(
      validateMulticlassSplit(
        state({ class_level: 19, secondary_class: { class_id: 20, class_level: 2, subclass_id: null } }),
        classes,
      ),
    ).toContain("20");
  });

  it("limita nível da segunda classe", () => {
    expect(maxSecondaryClassLevel(state({ class_level: 17 }))).toBe(3);
  });
});
