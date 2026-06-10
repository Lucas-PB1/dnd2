import { describe, expect, it } from "vitest";
import { passivePerception } from "@/features/character-sheet/domain/sheet-display";
import {
  mapAbilityScores,
  mapActiveEffect,
  mapInventoryItem,
  mapRollContextResponse,
  mapSavingThrow,
  mapSheetRpcResponse,
  mapSkill,
  mapSpellcastingBlock,
  mapStatModifier,
  mapSpellSlot,
  mapWeaponAttack,
  mergeSkillCatalog,
} from "@/lib/character/map-sheet";

describe("map-sheet mappers", () => {
  it("mapeia atributos efetivos do roll context", () => {
    const abilities = mapAbilityScores({
      STR: { score: 16, modifier: 3 },
      CON: { score: 14, modifier: 2 },
      INT: { score: 10, modifier: 0 },
    });

    expect(abilities).toEqual([
      { ability: "STR", label: "Força", score: 16, modifier: 3 },
      { ability: "CON", label: "Constituição", score: 14, modifier: 2 },
      { ability: "INT", label: "Inteligência", score: 10, modifier: 0 },
    ]);
  });

  it("mapeia salvaguardas e perícias do roll context", () => {
    const roll = mapRollContextResponse({
      abilities: { WIS: { score: 14, modifier: 2 } },
      saving_throws: [
        { ability: "WIS", modifier: 4, proficient: true },
      ],
      skills: [
        {
          skill: "Perception",
          base_attribute: "WIS",
          modifier: 4,
          proficient: true,
          expertise: false,
        },
      ],
    });

    expect(roll.saving_throws[0]).toMatchObject({
      ability: "WIS",
      modifier: 4,
      proficient: true,
    });
    expect(roll.skills[0]).toMatchObject({
      skill: "Perception",
      modifier: 4,
      proficient: true,
    });
  });

  it("preenche perícias ausentes no roll context com modificador base do catálogo", () => {
    const abilities = mapAbilityScores({
      WIS: { score: 14, modifier: 2 },
    });
    const merged = mergeSkillCatalog(
      [
        { name: "Perception", base_attribute: "WIS" },
        { name: "Stealth", base_attribute: "DEX" },
      ],
      [
        {
          skill: "Perception",
          base_attribute: "WIS",
          modifier: 4,
          proficient: true,
          expertise: false,
        },
      ],
      abilities,
    );

    expect(merged.find((entry) => entry.skill === "Perception")?.modifier).toBe(4);
    expect(merged.find((entry) => entry.skill === "Stealth")?.modifier).toBe(0);
    expect(passivePerception(merged)).toBe(14);
  });

  it("mapeia spell attack e CD usando atributo efetivo", () => {
    const block = mapSpellcastingBlock({
      class_id: 3,
      class_name: "Wizard",
      class_level: 5,
      spellcasting_ability: "INT",
      prepared_count: 9,
      spell_attack_bonus: 7,
      spell_save_dc: 15,
    });

    expect(block).toEqual({
      class_id: 3,
      class_name: "Wizard",
      class_level: 5,
      spellcasting_ability: "INT",
      prepared_count: 9,
      spell_attack_bonus: 7,
      spell_save_dc: 15,
    });
  });

  it("mapeia inventário com arma, armadura, equipamento e sintonização", () => {
    const weapon = mapInventoryItem({
      item_id: 1,
      name: "Longsword",
      quantity: 1,
      is_equipped: true,
      item_type: "Weapon",
      weapon_category: "Martial",
      damage_die: "d8",
      is_attuned: false,
      requires_attunement: false,
    });
    const armor = mapInventoryItem({
      item_id: 2,
      name: "Chain Mail",
      quantity: 1,
      is_equipped: true,
      item_type: "Armor",
      armor_category: "Heavy",
      ac_bonus: 16,
      is_attuned: false,
      requires_attunement: false,
    });
    const magic = mapInventoryItem({
      item_id: 3,
      name: "Ring of Protection",
      quantity: 1,
      is_equipped: true,
      item_type: "Item",
      is_magical: true,
      is_attuned: true,
      requires_attunement: true,
    });

    expect(weapon?.item_type).toBe("Weapon");
    expect(weapon?.is_equipped).toBe(true);
    expect(armor?.armor_category).toBe("Heavy");
    expect(magic?.is_attuned).toBe(true);
    expect(magic?.requires_attunement).toBe(true);
  });

  it("mapeia efeitos ativos e stat modifiers do RPC", () => {
    const sheet = mapSheetRpcResponse({
      summary: {
        armor_class: 18,
        effective_armor_class: 19,
        speed: 30,
        effective_speed: 20,
        max_hp: 45,
        effective_max_hp: 55,
        current_hp: 45,
      },
      traits: [
        {
          trait_id: 1,
          trait_name: "Weapon Mastery",
          source_type: "class",
          source_name: "Fighter",
          level_required: 1,
        },
      ],
      proficiencies: [
        {
          proficiency_type: "tool",
          tool_id: 7,
          name: "Thieves' Tools",
          tool_category: "Other",
          tool_base_attribute: "DEX",
          source_type: "class",
          source_id: 9,
        },
      ],
      active_effects: [
        {
          source_type: "spell",
          source_name: "Bless",
          effect_name: "Blessed",
          is_active: true,
          modifiers: [{ affected_stat: "attack", modifier_value: 1 }],
        },
      ],
      stat_modifiers: [
        {
          affected_stat: "armor_class",
          operation: "add",
          modifier_value: 1,
          source_name: "Shield",
          is_active: true,
        },
      ],
    });

    expect(sheet.summary?.armor_class).toBe(18);
    expect(sheet.summary?.effective_armor_class).toBe(19);
    expect(sheet.summary?.effective_speed).toBe(20);
    expect(sheet.summary?.effective_max_hp).toBe(55);
    expect(sheet.traits[0]?.trait_name).toBe("Weapon Mastery");
    expect(sheet.proficiencies[0]).toMatchObject({
      name: "Thieves' Tools",
      tool_base_attribute: "DEX",
    });
    expect(sheet.active_effects[0]?.effect_name).toBe("Blessed");
    expect(sheet.stat_modifiers[0]?.source_name).toBe("Shield");
  });

  it("usa armor_class e speed como fallback para summary antigo", () => {
    const sheet = mapSheetRpcResponse({
      summary: { armor_class: 16, speed: 30, max_hp: 12, current_hp: 12 },
    });

    expect(sheet.summary?.effective_armor_class).toBe(16);
    expect(sheet.summary?.effective_speed).toBe(30);
    expect(sheet.summary?.effective_max_hp).toBe(12);
  });

  it("mapeia ataques equipados do roll context", () => {
    const weapon = mapWeaponAttack({
      item_id: 10,
      name: "Rapier",
      is_equipped: true,
      attack_ability: "DEX",
      attack_ability_options: ["STR", "DEX"],
      proficient: true,
      attack_bonus: 6,
      damage_formula: "1d8+3",
      damage_type: "Piercing",
      mastery_name: "Vex",
    });

    expect(weapon).toMatchObject({
      name: "Rapier",
      is_equipped: true,
      attack_ability_options: ["STR", "DEX"],
      proficient: true,
      attack_bonus: 6,
      mastery_name: "Vex",
    });
  });

  it("mapeia spell_slots e recursos do roll context", () => {
    const roll = mapRollContextResponse({
      abilities: {},
      spell_slots: [
        { slot_level: 1, max_slots: 4, used_slots: 1, remaining: 3 },
        { slot_level: 2, max_slots: 0, used_slots: 0, remaining: 0 },
      ],
      resources: [
        {
          trait_id: 1,
          resource_key: "rage",
          name: "Rage",
          max_uses: 2,
          used_uses: 1,
          reset_on: "Long Rest",
        },
      ],
    });

    expect(roll.spell_slots).toEqual([
      { slot_level: 1, max_slots: 4, used_slots: 1 },
    ]);
    expect(roll.resources).toEqual([
      {
        trait_id: 1,
        resource_key: "rage",
        name: "Rage",
        max_uses: 2,
        used_uses: 1,
        reset_on: "Long Rest",
      },
    ]);
    expect(mapSpellSlot({ slot_level: 3, max_slots: 2, used_slots: 0 })).toEqual({
      slot_level: 3,
      max_slots: 2,
      used_slots: 0,
    });
  });

  it("ignora entradas inválidas sem quebrar o lote", () => {
    expect(mapSavingThrow({ ability: "INVALID", modifier: 1 })).toBeNull();
    expect(mapSkill({ skill: "X", base_attribute: "BAD", modifier: 0 })).toBeNull();
    expect(mapActiveEffect(null)).toBeNull();
    expect(mapStatModifier(undefined)).toBeNull();
  });
});
