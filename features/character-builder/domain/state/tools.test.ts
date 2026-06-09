import { describe, expect, it } from "vitest";
import { toggleClassTool } from "@/features/character-builder/domain/state/mutations";
import type { CharacterBuilderState } from "@/features/character-builder/types/builder.types";

function state(): CharacterBuilderState {
  return {
    step: 4,
    ability_method: "standard",
    ability_assignment: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    roll_slot_assignment: { STR: null, DEX: null, CON: null, INT: null, WIS: null, CHA: null },
    roll_sets: [],
    selected_roll_index: null,
    species_id: 1,
    background_id: 1,
    background_asi: { mode: "split", plus2: null, plus1: null },
    class_id: 1,
    class_level: 1,
    subclass_id: null,
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
    feat_spell_selections: [],
    spellbook_spell_ids: [],
    prepared_spell_ids: [],
    expertise_by_trait: {},
    class_trait_option_selections: [],
    progression_feat_slots: [],
    progression_feat_trait_options: [],
    size: "Medium",
    name: "Bard",
  };
}

describe("tool selections", () => {
  it("permite múltiplas ferramentas no mesmo grupo", () => {
    const base = state();
    const first = toggleClassTool(
      base,
      {
        tool_id: 1,
        name: "Lute",
        source_type: "class",
        source_id: 1,
        option_group: "Tool Proficiency",
      },
      3,
    );
    const second = toggleClassTool(
      first,
      {
        tool_id: 2,
        name: "Flute",
        source_type: "class",
        source_id: 1,
        option_group: "Tool Proficiency",
      },
      3,
    );
    const third = toggleClassTool(
      second,
      {
        tool_id: 3,
        name: "Drum",
        source_type: "class",
        source_id: 1,
        option_group: "Tool Proficiency",
      },
      3,
    );

    expect(third.class_tool_selections.map((entry) => entry.tool_id)).toEqual([
      1,
      2,
      3,
    ]);

    const removed = toggleClassTool(
      third,
      {
        tool_id: 2,
        name: "Flute",
        source_type: "class",
        source_id: 1,
        option_group: "Tool Proficiency",
      },
      3,
    );

    expect(removed.class_tool_selections.map((entry) => entry.tool_id)).toEqual([
      1,
      3,
    ]);
  });
});
