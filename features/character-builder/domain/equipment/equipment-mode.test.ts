import { describe, expect, it } from "vitest";
import {
  buildEquipmentInventory,
  effectiveEquipmentMode,
  resolveStartingGoldGp,
  supportsEquipmentModeToggle,
} from "@/features/character-builder/domain/equipment/equipment-mode";
import type {
  BuilderBackgroundEntry,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";

const background: BuilderBackgroundEntry = {
  id: 1,
  name: "Soldier",
  description: null,
  origin_feat_id: null,
  origin_feat_name: null,
  origin_feat_description: null,
  origin_feat_selection_key: null,
  ability_options: [],
  skill_proficiencies: [],
  tool_proficiency_options: [],
  equipment_options: [
    {
      option_key: "A",
      label: "Pacote A",
      gp_amount: null,
      notes: null,
      items: [{ item_id: 10, item_name: "Espada", quantity: 1, notes: null }],
    },
  ],
  origin_feat_choices: [],
  origin_feat_spellcasting: null,
};

function gearState(
  patch: Partial<CharacterBuilderState> = {},
): CharacterBuilderState {
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
    class_level: 5,
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
    spellbook_spell_ids: [],
    prepared_spell_ids: [],
    expertise_by_trait: {},
    class_trait_option_selections: [],
    progression_feat_slots: [],
    progression_feat_trait_options: [],
    feat_spell_selections: [],
    size: "Medium",
    name: "",
    ...patch,
  };
}

describe("equipment mode", () => {
  it("só permite toggle a partir do nível 2", () => {
    expect(supportsEquipmentModeToggle(1)).toBe(false);
    expect(supportsEquipmentModeToggle(2)).toBe(true);
    expect(effectiveEquipmentMode(1, "starting_gold")).toBe("background");
  });

  it("modo background mantém inventário do antecedente", () => {
    expect(buildEquipmentInventory(background, gearState())).toEqual([
      { item_id: 10, quantity: 1, is_equipped: false },
    ]);
    expect(resolveStartingGoldGp(gearState())).toBe(0);
  });

  it("modo starting_gold zera inventário e envia ouro PHB @ nível 5", () => {
    const state = gearState({ equipment_mode: "starting_gold", equipment_option_key: null });
    expect(buildEquipmentInventory(background, state)).toEqual([]);
    expect(resolveStartingGoldGp(state)).toBe(638);
  });

  it("starting_gold @ nível 2–4 concede 0 PO (sem bônus PHB)", () => {
    const state = gearState({ class_level: 3, equipment_mode: "starting_gold" });
    expect(resolveStartingGoldGp(state)).toBe(0);
  });
});
