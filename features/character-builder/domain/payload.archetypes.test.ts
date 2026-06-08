import { describe, expect, it } from "vitest";
import {
  buildRpcPayloadFromBuilderState,
  toCreateCharacterRpcBody,
} from "@/features/character-builder/domain/payload";
import { expectedResourceMaxUses } from "@/features/character-builder/domain/post-creation/expected-resources";
import { ASI_FEAT_NAME } from "@/features/character-builder/domain/progression/feats";
import { proficiencyBonusForLevel } from "@/features/character-builder/domain/progression/levels";
import { spellSlotsForClass } from "@/features/character-builder/domain/progression/spell-slots";
import type {
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";

const ABILITIES = {
  STR: 15,
  DEX: 14,
  CON: 13,
  INT: 10,
  WIS: 12,
  CHA: 8,
} as const;

const ASI_FEAT_ID = 501;
const ASI_TRAIT_ID = 502;

function progressionAsiPatch(classLevel: number): {
  progression_feats: CharacterBuilderData["progression_feats"];
  progression_feat_slots: CharacterBuilderState["progression_feat_slots"];
  progression_feat_trait_options: CharacterBuilderState["progression_feat_trait_options"];
} {
  if (classLevel < 4) {
    return {
      progression_feats: [],
      progression_feat_slots: [],
      progression_feat_trait_options: [],
    };
  }

  const slots = [{ at_level: 4 as const, kind: "asi" as const, feat_id: ASI_FEAT_ID }];

  return {
    progression_feats: [
      {
        id: ASI_FEAT_ID,
        name: ASI_FEAT_NAME,
        description: null,
        category: "General",
        prerequisite_text: null,
        is_repeatable: true,
        origin_feat_choices: [
          {
            trait_id: ASI_TRAIT_ID,
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
    progression_feat_slots: slots,
    progression_feat_trait_options: [
      {
        trait_id: ASI_TRAIT_ID,
        option_group: "Ability Score",
        selection_key: "level_4:Ability Score:0",
        trait_option_id: 5021,
      },
      {
        trait_id: ASI_TRAIT_ID,
        option_group: "Ability Score",
        selection_key: "level_4:Ability Score:1",
        trait_option_id: 5022,
      },
    ],
  };
}

function baseState(
  patch: Partial<CharacterBuilderState> = {},
): CharacterBuilderState {
  const classLevel = patch.class_level ?? 1;
  const asi = progressionAsiPatch(classLevel);

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
    class_id: 1,
    class_level: 1,
    subclass_id: null,
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
    class_trait_option_selections: [],
    feat_spell_selections: [],
    size: "Medium",
    name: "Test Hero",
    ...patch,
    progression_feat_slots: patch.progression_feat_slots ?? asi.progression_feat_slots,
    progression_feat_trait_options:
      patch.progression_feat_trait_options ?? asi.progression_feat_trait_options,
  };
}

function minimalBackground(): CharacterBuilderData["backgrounds"][number] {
  return {
    id: 20,
    name: "Soldier",
    description: null,
    origin_feat_id: null,
    origin_feat_name: null,
    origin_feat_description: null,
    origin_feat_selection_key: null,
    ability_options: ["STR", "CON"],
    skill_proficiencies: [{ skill_id: 3, name: "Athletics", base_attribute: "STR" }],
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
  };
}

function minimalSpecies(): CharacterBuilderData["species"][number] {
  return {
    id: 10,
    name: "Dwarf",
    description: null,
    creature_type: "Humanoid",
    size_options: "Medium",
    base_speed: 30,
    traits: [],
  };
}

function minimalData(
  cls: CharacterBuilderData["classes"][number],
  classLevel = 1,
): CharacterBuilderData {
  const asi = progressionAsiPatch(classLevel);

  return {
    classes: [cls],
    species: [minimalSpecies()],
    backgrounds: [minimalBackground()],
    origin_feats: [],
    progression_feats: asi.progression_feats,
    tools_by_category: {},
    skills: cls.skill_choices.flatMap((group) => group.options),
    details_loaded: true,
  };
}

describe("payload por arquétipo (E2E builder → RPC)", () => {
  it("Barbarian 3 — subclasse + Rage @ 3", () => {
    const data = minimalData({
      id: 1,
      name: "Barbarian",
      hit_die: "d12",
      saving_throws: ["STR", "CON"],
      weapons: ["Simple", "Martial"],
      armor: ["Light", "Medium", "Shields"],
      skill_choices: [{
        choice_group: "class",
        choice_count: 2,
        notes: null,
        options: [
          { skill_id: 1, name: "Athletics", base_attribute: "STR" },
          { skill_id: 2, name: "Intimidation", base_attribute: "CHA" },
        ],
      }],
      tool_choices: [],
      spellcasting: null,
      expertise_choices: [],
      optional_feature_groups: [],
      features: [],
      subclasses: [{ id: 101, name: "Path of the Berserker", description: null, unlock_level: 3, features: [] }],
    }, 3);

    const state = baseState({
      class_id: 1,
      class_level: 3,
      subclass_id: 101,
    });

    const payload = buildRpcPayloadFromBuilderState(data, state);
    const rpc = toCreateCharacterRpcBody(payload);

    expect(rpc.classes[0]).toEqual({ class_id: 1, class_level: 3, subclass_id: 101 });
    expect(proficiencyBonusForLevel(3)).toBe(2);
    expect(expectedResourceMaxUses("feature-barbarian-rage", 3)).toBe(3);
    expect(payload.feats).toEqual([]);
  });

  it("Rogue 6 — expertise dupla @1 e @6", () => {
    const data = minimalData({
      id: 2,
      name: "Rogue",
      hit_die: "d8",
      saving_throws: ["DEX", "INT"],
      weapons: ["Simple", "Martial"],
      armor: ["Light"],
      skill_choices: [{
        choice_group: "class",
        choice_count: 4,
        notes: null,
        options: [
          { skill_id: 1, name: "Athletics", base_attribute: "STR" },
          { skill_id: 2, name: "Stealth", base_attribute: "DEX" },
          { skill_id: 3, name: "Perception", base_attribute: "WIS" },
          { skill_id: 4, name: "Acrobatics", base_attribute: "DEX" },
        ],
      }],
      tool_choices: [],
      spellcasting: null,
      expertise_choices: [
        {
          trait_id: 201,
          trait_name: "Expertise",
          level_required: 1,
          choice_count: 2,
          pool: "proficient",
          fixed_skills: [],
          notes: null,
        },
        {
          trait_id: 202,
          trait_name: "Expertise",
          level_required: 6,
          choice_count: 2,
          pool: "proficient",
          fixed_skills: [],
          notes: null,
        },
      ],
      optional_feature_groups: [],
      features: [],
      subclasses: [{ id: 201, name: "Thief", description: null, unlock_level: 3, features: [] }],
    }, 6);

    const state = baseState({
      class_id: 2,
      class_level: 6,
      subclass_id: 201,
      class_skill_ids: [1, 2, 3, 4],
      expertise_by_trait: {
        "201:1": [1, 2],
        "202:6": [3, 4],
      },
    });

    const payload = buildRpcPayloadFromBuilderState(data, state);
    const rpc = toCreateCharacterRpcBody(payload);

    expect(rpc.classes[0].class_level).toBe(6);
    expect(proficiencyBonusForLevel(6)).toBe(3);

    const skills = rpc.skills as { skill_id: number; has_expertise?: boolean }[];
    const expertSkills = skills.filter((entry) => entry.has_expertise);
    expect(expertSkills).toHaveLength(4);
    expect(expertSkills.map((entry) => entry.skill_id).sort()).toEqual([1, 2, 3, 4]);
  });

  it("Warlock 7 — invocações + pact slots", () => {
    const data = minimalData({
      id: 3,
      name: "Warlock",
      hit_die: "d8",
      saving_throws: ["WIS", "CHA"],
      weapons: ["Simple"],
      armor: ["Light"],
      skill_choices: [{
        choice_group: "class",
        choice_count: 2,
        notes: null,
        options: [
          { skill_id: 5, name: "Arcana", base_attribute: "INT" },
          { skill_id: 6, name: "Deception", base_attribute: "CHA" },
        ],
      }],
      tool_choices: [],
      spellcasting: {
        spellcasting_ability: "CHA",
        cantrip_count: 2,
        prepared_count: 2,
        spellbook_count: 0,
        uses_spellbook: false,
        max_spell_level: 4,
        spells: [
          { spell_id: 1, name: "Eldritch Blast", level: 0, school: "Evocation", requires_concentration: false, requires_ritual: false, casting_time: null, range_text: null, components: null, material_component: null, duration_text: null, save_attribute: null, attack_type: null, character_effect_summary: null, description: null },
          { spell_id: 2, name: "Mage Hand", level: 0, school: "Conjuration", requires_concentration: false, requires_ritual: false, casting_time: null, range_text: null, components: null, material_component: null, duration_text: null, save_attribute: null, attack_type: null, character_effect_summary: null, description: null },
          { spell_id: 101, name: "Hex", level: 1, school: "Enchantment", requires_concentration: true, requires_ritual: false, casting_time: null, range_text: null, components: null, material_component: null, duration_text: null, save_attribute: null, attack_type: null, character_effect_summary: null, description: null },
          { spell_id: 102, name: "Armor of Agathys", level: 1, school: "Abjuration", requires_concentration: false, requires_ritual: false, casting_time: null, range_text: null, components: null, material_component: null, duration_text: null, save_attribute: null, attack_type: null, character_effect_summary: null, description: null },
        ],
      },
      expertise_choices: [],
      optional_feature_groups: [
        {
          group_key: "warlock-invocations",
          trait_id: 301,
          trait_name: "Eldritch Invocations",
          trait_description: null,
          option_group: "Invocation",
          choice_count: 2,
          level_required: 2,
          tab_label: "Invocações",
          notes: null,
          options: [
            { trait_option_id: 3011, name: "Agonizing Blast", description: null, option_group: "Invocation" },
            { trait_option_id: 3012, name: "Devil's Sight", description: null, option_group: "Invocation" },
          ],
        },
      ],
      features: [],
      subclasses: [{ id: 301, name: "Fiend Patron", description: null, unlock_level: 3, features: [] }],
    }, 7);

    const state = baseState({
      class_id: 3,
      class_level: 7,
      subclass_id: 301,
      class_skill_ids: [5, 6],
      cantrip_spell_ids: [1, 2],
      prepared_spell_ids: [101, 102],
      class_trait_option_selections: [
        { trait_id: 301, option_group: "Invocation", selection_key: "default:0", trait_option_id: 3011 },
        { trait_id: 301, option_group: "Invocation", selection_key: "default:1", trait_option_id: 3012 },
      ],
    });

    const payload = buildRpcPayloadFromBuilderState(data, state);

    expect(payload.trait_options.filter((entry) => entry.trait_id === 301)).toHaveLength(2);
    expect(payload.spells).toHaveLength(4);
    expect(payload.spells.filter((entry) => entry.is_prepared)).toHaveLength(2);
    expect(spellSlotsForClass("Warlock", 7)).toEqual([{ slotLevel: 4, count: 2 }]);
  });

  it("Fighter 5 Battle Master — manobras + Second Wind", () => {
    const data = minimalData({
      id: 4,
      name: "Fighter",
      hit_die: "d10",
      saving_throws: ["STR", "CON"],
      weapons: ["Simple", "Martial"],
      armor: ["Light", "Medium", "Heavy", "Shields"],
      skill_choices: [{
        choice_group: "class",
        choice_count: 2,
        notes: null,
        options: [
          { skill_id: 1, name: "Athletics", base_attribute: "STR" },
          { skill_id: 2, name: "Intimidation", base_attribute: "CHA" },
        ],
      }],
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
          options: [{ trait_option_id: 4011, name: "Defense", description: null, option_group: "Fighting Style" }],
        },
        {
          group_key: "battle-master-maneuvers",
          trait_id: 402,
          trait_name: "Combat Superiority",
          trait_description: null,
          option_group: "Maneuver",
          choice_count: 3,
          level_required: 3,
          tab_label: "Manobras",
          notes: null,
          options: [
            { trait_option_id: 4021, name: "Trip Attack", description: null, option_group: "Maneuver" },
            { trait_option_id: 4022, name: "Riposte", description: null, option_group: "Maneuver" },
            { trait_option_id: 4023, name: "Menacing Attack", description: null, option_group: "Maneuver" },
          ],
        },
      ],
      features: [],
      subclasses: [{ id: 401, name: "Battle Master", description: null, unlock_level: 3, features: [] }],
    }, 5);

    const state = baseState({
      class_id: 4,
      class_level: 5,
      subclass_id: 401,
      class_trait_option_selections: [
        { trait_id: 401, option_group: "Fighting Style", selection_key: "default:0", trait_option_id: 4011 },
        { trait_id: 402, option_group: "Maneuver", selection_key: "default:0", trait_option_id: 4021 },
        { trait_id: 402, option_group: "Maneuver", selection_key: "default:1", trait_option_id: 4022 },
        { trait_id: 402, option_group: "Maneuver", selection_key: "default:2", trait_option_id: 4023 },
      ],
    });

    const payload = buildRpcPayloadFromBuilderState(data, state);

    expect(payload.trait_options.filter((entry) => entry.option_group === "Maneuver")).toHaveLength(3);
    expect(expectedResourceMaxUses("feature-fighter-second-wind", 5)).toBe(3);
    expect(proficiencyBonusForLevel(5)).toBe(3);
  });

  it("Paladin 5 — half caster + Channel Divinity", () => {
    const data = minimalData({
      id: 5,
      name: "Paladin",
      hit_die: "d10",
      saving_throws: ["WIS", "CHA"],
      weapons: ["Simple", "Martial"],
      armor: ["Light", "Medium", "Heavy", "Shields"],
      skill_choices: [{
        choice_group: "class",
        choice_count: 2,
        notes: null,
        options: [
          { skill_id: 7, name: "Religion", base_attribute: "INT" },
          { skill_id: 8, name: "Persuasion", base_attribute: "CHA" },
        ],
      }],
      tool_choices: [],
      spellcasting: {
        spellcasting_ability: "CHA",
        cantrip_count: 0,
        prepared_count: 6,
        spellbook_count: 0,
        uses_spellbook: false,
        max_spell_level: 2,
        spells: Array.from({ length: 8 }, (_, index) => ({
          spell_id: 200 + index,
          name: `Paladin Spell ${index + 1}`,
          level: index < 4 ? 1 : 2,
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
        })),
      },
      expertise_choices: [],
      optional_feature_groups: [],
      features: [],
      subclasses: [{ id: 501, name: "Oath of Devotion", description: null, unlock_level: 3, features: [] }],
    }, 5);

    const state = baseState({
      class_id: 5,
      class_level: 5,
      subclass_id: 501,
      class_skill_ids: [7, 8],
      prepared_spell_ids: [200, 201, 202, 203, 204, 205],
    });

    const payload = buildRpcPayloadFromBuilderState(data, state);

    expect(payload.spells.filter((entry) => entry.is_prepared)).toHaveLength(6);
    expect(spellSlotsForClass("Paladin", 5)).toEqual([
      { slotLevel: 1, count: 4 },
      { slotLevel: 2, count: 2 },
    ]);
    expect(expectedResourceMaxUses("feature-paladin-channel-divinity", 5)).toBe(2);
    expect(proficiencyBonusForLevel(5)).toBe(3);
  });
});
