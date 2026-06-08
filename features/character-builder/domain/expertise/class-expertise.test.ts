import { describe, expect, it } from "vitest";
import { buildSkillsPayloadWithExpertise } from "@/features/character-builder/domain/expertise/class-expertise";
import type {
  CharacterBuilderData,
  CharacterBuilderState,
  BuilderTraitOption,
} from "@/features/character-builder/types/builder.types";

const PERCEPTION_SKILL_ID = 15;

function minimalState(
  patch: Partial<CharacterBuilderState> = {},
): CharacterBuilderState {
  return {
    step: 0,
    ability_method: "standard",
    ability_assignment: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    roll_slot_assignment: { STR: null, DEX: null, CON: null, INT: null, WIS: null, CHA: null },
    roll_sets: [],
    selected_roll_index: null,
    name: "",
    class_id: 1,
    class_level: 4,
    subclass_id: null,
    secondary_class: null,
    species_id: 1,
    background_id: 1,
    size: "Medium",
    background_asi: { mode: "split", plus2: null, plus1: null },
    class_skill_ids: [],
    class_tool_selections: [],
    background_tool_selections: [],
    equipment_mode: "background",
    equipment_option_key: null,
    shop_purchases: [],
    species_trait_options: [],
    origin_feat_trait_options: [],
    human_origin_feat_id: null,
    human_origin_feat_trait_options: [],
    cantrip_spell_ids: [],
    spellbook_spell_ids: [],
    prepared_spell_ids: [],
    expertise_by_trait: {},
    class_trait_option_selections: [],
    progression_feat_slots: [{ at_level: 4, kind: "feat", feat_id: 100 }],
    progression_feat_trait_options: [
      {
        trait_id: 200,
        option_group: "proficiency",
        selection_key: "level_4:proficiency:0",
        trait_option_id: 300,
      },
    ],
    feat_spell_selections: [],
    ...patch,
  };
}

function minimalData(): CharacterBuilderData {
  return {
    classes: [],
    species: [],
    backgrounds: [
      {
        id: 1,
        name: "Soldier",
        description: null,
        origin_feat_id: null,
        origin_feat_name: null,
        origin_feat_description: null,
        origin_feat_selection_key: null,
        ability_options: [],
        origin_feat_choices: [],
        origin_feat_spellcasting: null,
        skill_proficiencies: [
          { skill_id: PERCEPTION_SKILL_ID, name: "Perception", base_attribute: "WIS" },
        ],
        tool_proficiency_options: [],
        equipment_options: [],
      },
    ],
    origin_feats: [],
    progression_feats: [
      {
        id: 100,
        name: "Observant",
        description: null,
        category: "General",
        prerequisite_text: null,
        is_repeatable: false,
        origin_feat_choices: [
          {
            trait_id: 200,
            trait_name: "Observant: Keen Observer",
            trait_description:
              "Choose Insight, Investigation, or Perception. If you lack proficiency, you gain it; if you already have proficiency, you gain Expertise in it.",
            option_group: "proficiency",
            choice_count: 1,
            options: [
              {
                trait_option_id: 300,
                name: "Perception",
                description: null,
                option_group: "proficiency",
                skill_id: PERCEPTION_SKILL_ID,
              },
            ],
          },
        ],
        spellcasting: null,
      },
    ],
    tools_by_category: {},
    skills: [
      { skill_id: PERCEPTION_SKILL_ID, name: "Perception", base_attribute: "WIS" },
    ],
    details_loaded: true,
  } satisfies CharacterBuilderData;
}

describe("buildSkillsPayloadWithExpertise", () => {
  it("concede expertise quando feat escolhe perícia já proficiente", () => {
    const payload = buildSkillsPayloadWithExpertise(
      minimalData(),
      minimalState(),
    );

    const perception = payload.find(
      (entry) => entry.skill_id === PERCEPTION_SKILL_ID,
    );
    expect(perception).toEqual({
      skill_id: PERCEPTION_SKILL_ID,
      is_proficient: true,
      has_expertise: true,
    });
  });

  it("concede só proficiência quando feat escolhe perícia nova", () => {
    const data = minimalData();
    data.backgrounds[0].skill_proficiencies = [];

    const payload = buildSkillsPayloadWithExpertise(data, minimalState());

    const perception = payload.find(
      (entry) => entry.skill_id === PERCEPTION_SKILL_ID,
    );
    expect(perception).toEqual({
      skill_id: PERCEPTION_SKILL_ID,
      is_proficient: true,
      has_expertise: false,
    });
  });
});
