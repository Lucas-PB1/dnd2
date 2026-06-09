import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CharacterBuilderState } from "@/features/character-builder/types/builder.types";

vi.mock("@/features/character-builder/server", () => ({
  fetchCharacterBuilderDataForState: vi.fn(),
}));

vi.mock("@/features/character-builder/domain/payload", () => ({
  buildRpcPayloadFromBuilderState: vi.fn(() => ({ payload: true })),
  toCreateCharacterRpcBody: vi.fn(() => ({ rpc: true })),
}));

import { fetchCharacterBuilderDataForState } from "@/features/character-builder/server";
import {
  buildRpcPayloadFromBuilderState,
  toCreateCharacterRpcBody,
} from "@/features/character-builder/domain/payload";
import { createCharacterFromBuilderState } from "./create";

function state(
  patch: Partial<CharacterBuilderState> = {},
): CharacterBuilderState {
  return {
    step: 5,
    ability_method: "standard",
    ability_assignment: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    roll_slot_assignment: { STR: null, DEX: null, CON: null, INT: null, WIS: null, CHA: null },
    roll_sets: [],
    selected_roll_index: null,
    species_id: 10,
    background_id: 20,
    background_asi: { mode: "split", plus2: null, plus1: null },
    class_id: 30,
    class_level: 5,
    subclass_id: 301,
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
    name: "Hero",
    ...patch,
  };
}

describe("createCharacterFromBuilderState", () => {
  beforeEach(() => {
    vi.mocked(fetchCharacterBuilderDataForState).mockResolvedValue({
      classes: [],
      species: [],
      backgrounds: [],
      origin_feats: [],
      progression_feats: [],
      tools_by_category: {},
      skills: [],
      details_loaded: true,
    });
    vi.mocked(buildRpcPayloadFromBuilderState).mockClear();
    vi.mocked(toCreateCharacterRpcBody).mockClear();
  });

  it("recarrega detalhes com subclass_id antes de montar o RPC", async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: { character_id: 123, level: 5 },
        error: null,
      }),
    };

    const result = await createCharacterFromBuilderState(
      supabase as unknown as Parameters<typeof createCharacterFromBuilderState>[0],
      state(),
    );

    expect(fetchCharacterBuilderDataForState).toHaveBeenCalledWith({
      class_id: 30,
      species_id: 10,
      background_id: 20,
      class_level: 5,
      subclass_id: 301,
    });
    expect(supabase.rpc).toHaveBeenCalledWith("create_character", {
      p_payload: { rpc: true },
    });
    expect(result).toEqual({ character_id: 123, level: 5 });
  });

  it("rejeita nível total acima de 20 antes do RPC", async () => {
    const supabase = { rpc: vi.fn() };

    await expect(
      createCharacterFromBuilderState(
        supabase as unknown as Parameters<typeof createCharacterFromBuilderState>[0],
        state({
          class_level: 19,
          secondary_class: { class_id: 40, class_level: 2, subclass_id: null },
        }),
      ),
    ).rejects.toThrow(/20/);

    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
