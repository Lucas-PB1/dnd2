import { describe, expect, it } from "vitest";
import {
  buildSpellsRpcPayload,
  validateSpellSelections,
} from "@/features/character-builder/domain/spells/class-spells";
import { wizardSpellbookCount } from "@/features/character-builder/domain/progression/spell-progression";
import type {
  BuilderClassSpellcasting,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";

const CANTrips = [
  { spell_id: 1, name: "Fire Bolt", level: 0 },
  { spell_id: 2, name: "Mage Hand", level: 0 },
] as const;

const LEVELED = [
  { spell_id: 101, name: "Magic Missile", level: 1 },
  { spell_id: 102, name: "Misty Step", level: 2 },
  { spell_id: 103, name: "Fireball", level: 3 },
] as const;

function spellOption(
  spell: (typeof CANTrips | typeof LEVELED)[number],
) {
  return {
    ...spell,
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
  };
}

function wizardSpellcasting(
  patch: Partial<BuilderClassSpellcasting> = {},
): BuilderClassSpellcasting {
  return {
    spellcasting_ability: "INT",
    cantrip_count: 2,
    prepared_count: 2,
    spellbook_count: 3,
    uses_spellbook: true,
    max_spell_level: 3,
    spells: [...CANTrips, ...LEVELED].map(spellOption),
    ...patch,
  };
}

function spellState(
  patch: Partial<CharacterBuilderState> = {},
): CharacterBuilderState {
  return {
    step: 4,
    ability_method: "standard",
    ability_assignment: { STR: 10, DEX: 14, CON: 12, INT: 16, WIS: 10, CHA: 8 },
    roll_slot_assignment: { STR: null, DEX: null, CON: null, INT: null, WIS: null, CHA: null },
    roll_sets: [],
    selected_roll_index: null,
    species_id: 1,
    background_id: 1,
    background_asi: { mode: "split", plus2: "INT", plus1: "DEX" },
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
    equipment_option_key: "A",
    equipment_mode: "background" as const,
    shop_purchases: [],
    cantrip_spell_ids: [1, 2],
    spellbook_spell_ids: [101, 102, 103],
    prepared_spell_ids: [101, 102],
    expertise_by_trait: {},
    class_trait_option_selections: [],
    progression_feat_slots: [],
    progression_feat_trait_options: [],
    feat_spell_selections: [],
    size: "Medium",
    name: "Elara",
    ...patch,
  };
}

describe("validateSpellSelections", () => {
  it("aceita seleção válida de truques, grimório e preparadas", () => {
    expect(
      validateSpellSelections(wizardSpellcasting(), spellState()),
    ).toBeNull();
  });

  it("rejeita contagem incorreta de truques", () => {
    expect(
      validateSpellSelections(
        wizardSpellcasting(),
        spellState({ cantrip_spell_ids: [1] }),
      ),
    ).toMatch(/2 truque/);
  });

  it("rejeita truque fora da lista da classe", () => {
    expect(
      validateSpellSelections(
        wizardSpellcasting(),
        spellState({ cantrip_spell_ids: [1, 999] }),
      ),
    ).toMatch(/Truque inválido/);
  });

  it("rejeita grimório incompleto", () => {
    expect(
      validateSpellSelections(
        wizardSpellcasting(),
        spellState({ spellbook_spell_ids: [101, 102] }),
      ),
    ).toMatch(/3 magia/);
  });

  it("rejeita magia de grimório acima do slot máximo", () => {
    expect(
      validateSpellSelections(
        wizardSpellcasting({ max_spell_level: 1 }),
        spellState({
          spellbook_spell_ids: [101, 102, 101],
          prepared_spell_ids: [101, 101],
        }),
      ),
    ).toMatch(/inválida/);
  });

  it("rejeita preparadas fora do grimório (Wizard)", () => {
    expect(
      validateSpellSelections(
        wizardSpellcasting(),
        spellState({ prepared_spell_ids: [101, 999] }),
      ),
    ).toMatch(/devem estar no grimório/);
  });

  it("rejeita grimório em classe sem spellbook", () => {
    const cleric = wizardSpellcasting({
      uses_spellbook: false,
      spellbook_count: 0,
      prepared_count: 2,
    });

    expect(
      validateSpellSelections(
        cleric,
        spellState({
          spellbook_spell_ids: [101],
          prepared_spell_ids: [101, 102],
        }),
      ),
    ).toMatch(/não usa grimório/);
  });

  it("valida preparadas direto da lista em non-wizard", () => {
    const cleric = wizardSpellcasting({
      uses_spellbook: false,
      spellbook_count: 0,
      prepared_count: 2,
    });

    expect(
      validateSpellSelections(
        cleric,
        spellState({
          spellbook_spell_ids: [],
          prepared_spell_ids: [101, 102],
        }),
      ),
    ).toBeNull();
  });
});

describe("buildSpellsRpcPayload", () => {
  it("marca truques e grimório como não preparados; preparadas como preparadas", () => {
    const payload = buildSpellsRpcPayload(spellState());

    expect(payload).toEqual(
      expect.arrayContaining([
        { spell_id: 1, source_type: "class", is_prepared: false, always_prepared: false },
        { spell_id: 2, source_type: "class", is_prepared: false, always_prepared: false },
        { spell_id: 101, source_type: "class", is_prepared: true, always_prepared: false },
        { spell_id: 102, source_type: "class", is_prepared: true, always_prepared: false },
        { spell_id: 103, source_type: "class", is_prepared: false, always_prepared: false },
      ]),
    );
    expect(payload).toHaveLength(5);
  });

  it("deduplica magia presente no grimório e nas preparadas", () => {
    const payload = buildSpellsRpcPayload(
      spellState({ prepared_spell_ids: [101, 101] }),
    );

    expect(payload.filter((entry) => entry.spell_id === 101)).toHaveLength(1);
    expect(payload.find((entry) => entry.spell_id === 101)?.is_prepared).toBe(true);
  });
});

describe("wizard spellbook acumulado @ nível N", () => {
  it("segue fórmula PHB @ 1, 5, 10 e 20", () => {
    expect(wizardSpellbookCount(1)).toBe(6);
    expect(wizardSpellbookCount(5)).toBe(14);
    expect(wizardSpellbookCount(10)).toBe(24);
    expect(wizardSpellbookCount(20)).toBe(44);
  });
});
