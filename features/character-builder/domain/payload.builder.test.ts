import { describe, expect, it } from "vitest";
import {
  buildRpcPayloadFromBuilderState,
  toCreateCharacterRpcBody,
} from "@/features/character-builder/domain/payload";
import { wizardSpellbookCount } from "@/features/character-builder/domain/progression/spell-progression";
import { ASI_FEAT_NAME } from "@/features/character-builder/domain/progression/feats";
import type {
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";

const ABILITIES = {
  STR: 15,
  DEX: 13,
  CON: 14,
  INT: 10,
  WIS: 12,
  CHA: 8,
} as const;

function baseState(
  patch: Partial<CharacterBuilderState> = {},
): CharacterBuilderState {
  return {
    step: 5,
    ability_method: "standard",
    ability_assignment: { ...ABILITIES },
    roll_slot_assignment: { STR: null, DEX: null, CON: null, INT: null, WIS: null, CHA: null },
    roll_sets: [],
    selected_roll_index: null,
    species_id: 10,
    background_id: 20,
    background_asi: { mode: "split", plus2: "STR", plus1: "CON" },
    class_id: 30,
    class_level: 5,
    subclass_id: 301,
    secondary_class: null,
    class_skill_ids: [1, 2],
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
    class_trait_option_selections: [
      {
        trait_id: 401,
        option_group: "Fighting Style",
        selection_key: "default:0",
        trait_option_id: 4011,
      },
    ],
    progression_feat_slots: [{ at_level: 4, kind: "asi", feat_id: 501 }],
    progression_feat_trait_options: [
      {
        trait_id: 502,
        option_group: "Ability Score",
        selection_key: "level_4:Ability Score:0",
        trait_option_id: 5021,
      },
      {
        trait_id: 502,
        option_group: "Ability Score",
        selection_key: "level_4:Ability Score:1",
        trait_option_id: 5022,
      },
    ],
    feat_spell_selections: [],
    size: "Medium",
    name: "Thorin",
    ...patch,
  };
}

function fighterData(): CharacterBuilderData {
  return {
    classes: [
      {
        id: 30,
        name: "Fighter",
        hit_die: "d10",
        saving_throws: ["STR", "CON"],
        weapons: ["Simple", "Martial"],
        armor: ["Light", "Medium", "Heavy", "Shields"],
        skill_choices: [
          {
            choice_group: "class",
            choice_count: 2,
            notes: null,
            options: [
              { skill_id: 1, name: "Athletics", base_attribute: "STR" },
              { skill_id: 2, name: "Intimidation", base_attribute: "CHA" },
            ],
          },
        ],
        tool_choices: [],
        spellcasting: null,
        expertise_choices: [],
        optional_feature_groups: [
          {
            group_key: "fighter-fighting-style",
            trait_id: 401,
            trait_name: "Fighting Style",
            trait_description: null,
            option_group: "Fighting Style",
            choice_count: 1,
            level_required: 1,
            tab_label: "Estilo de luta",
            notes: null,
            options: [
              {
                trait_option_id: 4011,
                name: "Defense",
                description: null,
                option_group: "Fighting Style",
              },
            ],
          },
        ],
        features: [],
        subclasses: [{ id: 301, name: "Champion", description: null, unlock_level: 3, features: [] }],
      },
    ],
    species: [
      {
        id: 10,
        name: "Dwarf",
        description: null,
        creature_type: "Humanoid",
        size_options: "Medium",
        base_speed: 30,
        traits: [],
      },
    ],
    backgrounds: [
      {
        id: 20,
        name: "Soldier",
        description: null,
        origin_feat_id: null,
        origin_feat_name: null,
        origin_feat_description: null,
        origin_feat_selection_key: null,
        ability_options: ["STR", "CON"],
        skill_proficiencies: [
          { skill_id: 3, name: "Athletics", base_attribute: "STR" },
        ],
        tool_proficiency_options: [],
        equipment_options: [
          {
            option_key: "A",
            label: "Pacote A",
            gp_amount: null,
            notes: null,
            items: [{ item_id: 900, item_name: "Longsword", quantity: 1, notes: null }],
          },
        ],
        origin_feat_choices: [],
        origin_feat_spellcasting: null,
      },
    ],
    origin_feats: [],
    progression_feats: [
      {
        id: 501,
        name: ASI_FEAT_NAME,
        description: null,
        category: "General",
        prerequisite_text: null,
        is_repeatable: true,
        origin_feat_choices: [
          {
            trait_id: 502,
            trait_name: "Ability Score Improvement",
            trait_description: null,
            option_group: "Ability Score",
            choice_count: 2,
            options: [
              {
                trait_option_id: 5021,
                name: "Strength",
                description: null,
                option_group: "Ability Score",
              },
              {
                trait_option_id: 5022,
                name: "Constitution",
                description: null,
                option_group: "Ability Score",
              },
            ],
          },
        ],
        spellcasting: null,
      },
    ],
    tools_by_category: {},
    skills: [
      { skill_id: 1, name: "Athletics", base_attribute: "STR" },
      { skill_id: 2, name: "Intimidation", base_attribute: "CHA" },
      { skill_id: 3, name: "Athletics", base_attribute: "STR" },
    ],
    details_loaded: true,
  };
}

function wizardSpells(count: number, maxLevel: number) {
  const spells = [];
  for (let i = 1; i <= 4; i++) {
    spells.push({
      spell_id: i,
      name: `Cantrip ${i}`,
      level: 0,
      school: "Evocation",
      requires_concentration: false,
      requires_ritual: false,
      casting_time: null,
      range_text: null,
      components: null,
      material_component: null,
      duration_text: null,
      save_attribute: null,
      attack_type: null,
      character_effect_summary: null,
      description: null,
    });
  }
  for (let i = 1; i <= count; i++) {
    spells.push({
      spell_id: 100 + i,
      name: `Spell ${i}`,
      level: Math.min(maxLevel, ((i - 1) % maxLevel) + 1),
      school: "Evocation",
      requires_concentration: false,
      requires_ritual: false,
      casting_time: null,
      range_text: null,
      components: null,
      material_component: null,
      duration_text: null,
      save_attribute: null,
      attack_type: null,
      character_effect_summary: null,
      description: null,
    });
  }
  return spells;
}

function wizardData(): CharacterBuilderData {
  const spellbookCount = wizardSpellbookCount(10);
  const spellIds = Array.from({ length: spellbookCount }, (_, index) => 101 + index);
  const preparedIds = spellIds.slice(0, 15);

  return {
    classes: [
      {
        id: 40,
        name: "Wizard",
        hit_die: "d6",
        saving_throws: ["INT", "WIS"],
        weapons: ["Simple"],
        armor: [],
        skill_choices: [
          {
            choice_group: "class",
            choice_count: 2,
            notes: null,
            options: [
              { skill_id: 4, name: "Arcana", base_attribute: "INT" },
              { skill_id: 5, name: "History", base_attribute: "INT" },
            ],
          },
        ],
        tool_choices: [],
        spellcasting: {
          spellcasting_ability: "INT",
          cantrip_count: 4,
          prepared_count: 15,
          spellbook_count: spellbookCount,
          uses_spellbook: true,
          max_spell_level: 5,
          spells: wizardSpells(spellbookCount + 2, 5),
        },
        expertise_choices: [],
        optional_feature_groups: [],
        features: [],
        subclasses: [
          { id: 401, name: "Evoker", description: null, unlock_level: 3, features: [] },
        ],
      },
    ],
    species: fighterData().species,
    backgrounds: fighterData().backgrounds,
    origin_feats: [],
    progression_feats: fighterData().progression_feats,
    tools_by_category: {},
    skills: [
      { skill_id: 4, name: "Arcana", base_attribute: "INT" },
      { skill_id: 5, name: "History", base_attribute: "INT" },
    ],
    details_loaded: true,
  };
}

function wizardState(
  patch: Partial<CharacterBuilderState> = {},
): CharacterBuilderState {
  const spellbookCount = wizardSpellbookCount(10);
  const spellIds = Array.from({ length: spellbookCount }, (_, index) => 101 + index);

  return baseState({
    class_id: 40,
    class_level: 10,
    subclass_id: 401,
    class_skill_ids: [4, 5],
    cantrip_spell_ids: [1, 2, 3, 4],
    spellbook_spell_ids: spellIds,
    prepared_spell_ids: spellIds.slice(0, 15),
    progression_feat_slots: [
      { at_level: 4, kind: "asi", feat_id: 501 },
      { at_level: 8, kind: "asi", feat_id: 501 },
    ],
    progression_feat_trait_options: [
      {
        trait_id: 502,
        option_group: "Ability Score",
        selection_key: "level_4:Ability Score:0",
        trait_option_id: 5021,
      },
      {
        trait_id: 502,
        option_group: "Ability Score",
        selection_key: "level_4:Ability Score:1",
        trait_option_id: 5022,
      },
      {
        trait_id: 502,
        option_group: "Ability Score",
        selection_key: "level_8:Ability Score:0",
        trait_option_id: 5021,
      },
      {
        trait_id: 502,
        option_group: "Ability Score",
        selection_key: "level_8:Ability Score:1",
        trait_option_id: 5022,
      },
    ],
    class_trait_option_selections: [],
    ability_assignment: { STR: 8, DEX: 14, CON: 13, INT: 15, WIS: 12, CHA: 10 },
    background_asi: { mode: "split", plus2: "INT", plus1: "CON" },
    ...patch,
  });
}

describe("buildRpcPayloadFromBuilderState", () => {
  it("monta payload nível 5 Fighter (subclasse, ASI @4, Fighting Style)", () => {
    const payload = buildRpcPayloadFromBuilderState(fighterData(), baseState());

    expect(payload.class_level).toBe(5);
    expect(payload.subclass_id).toBe(301);
    expect(payload.class_id).toBe(30);
    expect(payload.feats).toEqual([
      {
        feat_id: 501,
        source_type: "class",
        source_id: 30,
        selection_key: "level_4",
      },
    ]);
    expect(payload.trait_options.some((entry) => entry.trait_id === 401)).toBe(true);
    expect(payload.spells).toEqual([]);
    expect(payload.max_hp).toBe(65);
    expect(payload.inventory).toEqual([
      { item_id: 900, quantity: 1, is_equipped: false },
    ]);

    const rpc = toCreateCharacterRpcBody(payload);
    expect(rpc.classes[0]).toEqual({
      class_id: 30,
      class_level: 5,
      subclass_id: 301,
    });
  });

  it("monta payload nível 10 Wizard com grimório e preparadas acumuladas", () => {
    const payload = buildRpcPayloadFromBuilderState(wizardData(), wizardState());
    const spellbookCount = wizardSpellbookCount(10);

    expect(payload.class_level).toBe(10);
    expect(payload.subclass_id).toBe(401);
    expect(payload.spells).toHaveLength(spellbookCount + 4);
    expect(payload.spells.filter((entry) => entry.is_prepared)).toHaveLength(15);
    expect(payload.spells.filter((entry) => !entry.is_prepared).length).toBeGreaterThan(0);
    expect(payload.feats.map((entry) => entry.selection_key)).toEqual([
      "level_4",
      "level_8",
    ]);
  });

  it("monta payload nível 10 com ouro PHB e pacote do antecedente", () => {
    const state = wizardState({
      equipment_mode: "starting_gold",
      equipment_option_key: "A",
    });

    const payload = buildRpcPayloadFromBuilderState(wizardData(), state);

    expect(payload.inventory).toEqual([
      { item_id: 900, quantity: 1, is_equipped: false },
    ]);
    expect(payload.starting_gold_gp).toBeGreaterThan(0);

    const rpc = toCreateCharacterRpcBody(payload);
    expect(rpc.starting_gold_gp).toBe(payload.starting_gold_gp);
  });

  it("Fighter nível 5 reflete ASI em CON no HP final", () => {
    const data = fighterData();
    const strAsiState = baseState({
      progression_feat_trait_options: [
        {
          trait_id: 502,
          option_group: "Ability Score",
          selection_key: "level_4:Ability Score:0",
          trait_option_id: 5021,
        },
        {
          trait_id: 502,
          option_group: "Ability Score",
          selection_key: "level_4:Ability Score:1",
          trait_option_id: 5021,
        },
      ],
    });

    const withMixedAsi = buildRpcPayloadFromBuilderState(data, baseState());
    const withStrAsi = buildRpcPayloadFromBuilderState(data, strAsiState);

    expect(withMixedAsi.max_hp).toBeGreaterThan(withStrAsi.max_hp ?? 0);
    expect(withMixedAsi.max_hp).toBe(65);
    expect(withStrAsi.max_hp).toBe(60);
  });

  it("combina ASI, equipamento starting_gold e ferramentas de classe no payload", () => {
    const data = fighterData();
    data.classes[0].tool_choices = [
      {
        option_group: "Tool Proficiency",
        choice_count: 3,
        notes: null,
        tool_category: "Musical Instrument",
        options: [
          { tool_id: 1, name: "Lute", category: "Musical Instrument" },
          { tool_id: 2, name: "Flute", category: "Musical Instrument" },
          { tool_id: 3, name: "Drum", category: "Musical Instrument" },
        ],
      },
    ];

    const payload = buildRpcPayloadFromBuilderState(
      data,
      baseState({
        class_level: 5,
        equipment_mode: "starting_gold",
        equipment_option_key: "A",
        class_tool_selections: [
          {
            tool_id: 1,
            name: "Lute",
            source_type: "class",
            source_id: 30,
            option_group: "Tool Proficiency",
          },
          {
            tool_id: 2,
            name: "Flute",
            source_type: "class",
            source_id: 30,
            option_group: "Tool Proficiency",
          },
          {
            tool_id: 3,
            name: "Drum",
            source_type: "class",
            source_id: 30,
            option_group: "Tool Proficiency",
          },
        ],
      }),
    );

    expect(payload.feats).toHaveLength(1);
    expect(payload.inventory).toEqual([
      { item_id: 900, quantity: 1, is_equipped: false },
    ]);
    expect(payload.starting_gold_gp).toBeGreaterThan(0);
    expect(payload.proficiencies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tool_id: 1, source_type: "class", source_id: 30 }),
        expect.objectContaining({ tool_id: 2, source_type: "class", source_id: 30 }),
        expect.objectContaining({ tool_id: 3, source_type: "class", source_id: 30 }),
      ]),
    );
  });
});
