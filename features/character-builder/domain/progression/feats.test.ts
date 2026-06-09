import { describe, expect, it } from "vitest";
import {
  ASI_FEAT_NAME,
  featEligibleAtLevel,
  featsForProgressionSlot,
  validateProgressionFeatSelections,
} from "@/features/character-builder/domain/progression/feats";
import type {
  AbilityKey,
  BuilderProgressionFeat,
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";

const ABILITIES: Record<AbilityKey, number> = {
  STR: 12,
  DEX: 13,
  CON: 10,
  INT: 10,
  WIS: 10,
  CHA: 10,
};

function feat(
  patch: Partial<BuilderProgressionFeat>,
): BuilderProgressionFeat {
  return {
    id: 1,
    name: "Test Feat",
    description: null,
    category: "General",
    prerequisite_text: null,
    is_repeatable: false,
    origin_feat_choices: [],
    spellcasting: null,
    ...patch,
  };
}

function state(
  patch: Partial<CharacterBuilderState> = {},
): CharacterBuilderState {
  return {
    step: 4,
    ability_method: "standard",
    ability_assignment: { ...ABILITIES },
    roll_slot_assignment: { STR: null, DEX: null, CON: null, INT: null, WIS: null, CHA: null },
    roll_sets: [],
    selected_roll_index: null,
    species_id: 1,
    background_id: 1,
    background_asi: { mode: "split", plus2: null, plus1: null },
    class_id: 1,
    class_level: 8,
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
    progression_feat_slots: [
      { at_level: 4, kind: "feat", feat_id: 10 },
      { at_level: 8, kind: "feat", feat_id: 11 },
    ],
    progression_feat_trait_options: [],
    size: "Medium",
    name: "Hero",
    ...patch,
  };
}

function data(
  progression_feats: BuilderProgressionFeat[],
): CharacterBuilderData {
  return {
    classes: [],
    species: [],
    backgrounds: [],
    origin_feats: [],
    progression_feats,
    tools_by_category: {},
    skills: [],
    details_loaded: true,
  };
}

describe("progression feats", () => {
  it("trata prerequisitos com nomes completos de atributos como alternativas", () => {
    const dualWielder = feat({
      prerequisite_text: "Level 4 + Strength 13+,Dexterity 13+",
    });

    expect(featEligibleAtLevel(dualWielder, 4, ABILITIES)).toBe(true);
    expect(featEligibleAtLevel(dualWielder, 3, ABILITIES)).toBe(false);
    expect(
      featEligibleAtLevel(dualWielder, 4, {
        ...ABILITIES,
        DEX: 12,
      }),
    ).toBe(false);
  });

  it("filtra feats pelo nível do slot, não pelo nível final do personagem", () => {
    const allData = data([
      feat({ id: 10, name: ASI_FEAT_NAME, is_repeatable: true }),
      feat({ id: 11, name: "Grappler", prerequisite_text: "Level 4" }),
      feat({
        id: 12,
        name: "Boon of Fortitude",
        category: "Epic Boon",
        prerequisite_text: "Level 19+",
      }),
    ]);
    const highLevelState = state({
      class_level: 19,
      progression_feat_slots: [
        { at_level: 4, kind: null, feat_id: null },
        { at_level: 8, kind: null, feat_id: null },
        { at_level: 12, kind: null, feat_id: null },
        { at_level: 16, kind: null, feat_id: null },
        { at_level: 19, kind: null, feat_id: null },
      ],
    });

    expect(
      featsForProgressionSlot(allData, highLevelState, 4, ABILITIES).map(
        (entry) => entry.name,
      ),
    ).toEqual(["Grappler"]);
    expect(
      featsForProgressionSlot(allData, highLevelState, 19, ABILITIES).map(
        (entry) => entry.name,
      ),
    ).toEqual(["Grappler", "Boon of Fortitude"]);
  });

  it("rejeita feat não repetível escolhido em dois slots", () => {
    const alert = feat({ id: 10, name: "Alert", is_repeatable: false });
    const allData = data([alert]);

    expect(
      validateProgressionFeatSelections(
        allData,
        state({
          progression_feat_slots: [
            { at_level: 4, kind: "feat", feat_id: 10 },
            { at_level: 8, kind: "feat", feat_id: 10 },
          ],
        }),
        ABILITIES,
      ),
    ).toContain("não pode");
  });

  it("permite ASI +2/+1 sem escolher o grupo terciário opcional", () => {
    const allData = data([
      feat({
        id: 20,
        name: ASI_FEAT_NAME,
        is_repeatable: true,
        origin_feat_choices: [
          {
            trait_id: 201,
            trait_name: "Ability Score Improvement",
            trait_description: null,
            option_group: "Primary Ability Score",
            choice_count: 1,
            is_required: true,
            options: [],
          },
          {
            trait_id: 201,
            trait_name: "Ability Score Improvement",
            trait_description: null,
            option_group: "Secondary Ability Score",
            choice_count: 1,
            is_required: true,
            options: [],
          },
          {
            trait_id: 201,
            trait_name: "Ability Score Improvement",
            trait_description: null,
            option_group: "Tertiary Ability Score",
            choice_count: 1,
            is_required: false,
            options: [],
          },
        ],
      }),
    ]);

    expect(
      validateProgressionFeatSelections(
        allData,
        state({
          class_level: 4,
          progression_feat_slots: [{ at_level: 4, kind: "asi", feat_id: 20 }],
          progression_feat_trait_options: [
            {
              trait_id: 201,
              option_group: "Primary Ability Score",
              selection_key: "level_4:Primary Ability Score:0",
              trait_option_id: 1,
            },
            {
              trait_id: 201,
              option_group: "Secondary Ability Score",
              selection_key: "level_4:Secondary Ability Score:0",
              trait_option_id: 2,
            },
          ],
        }),
        ABILITIES,
      ),
    ).toBeNull();
  });
});
