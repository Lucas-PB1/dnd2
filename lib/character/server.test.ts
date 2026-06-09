import { beforeEach, describe, expect, it, vi } from "vitest";

const adminFrom = vi.fn();
const adminRpc = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: adminFrom,
    rpc: adminRpc,
  })),
}));

import { getCharacterForUser } from "@/lib/character/server";

const CHARACTER_ROW = {
  id: 42,
  name: "Aldric",
  level: 5,
  proficiency_bonus: 3,
  starting_gold_gp: 0,
  updated_at: "2026-01-01T00:00:00Z",
  species: { name: "Human" },
  backgrounds: { name: "Soldier" },
  character_classes: [{ class_level: 5, classes: { name: "Fighter" } }],
};

function queryResult(data: unknown, error: unknown = null) {
  return Promise.resolve({ data, error });
}

function chain(terminal: () => Promise<{ data: unknown; error: unknown }>) {
  const result = terminal();
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    maybeSingle: vi.fn(() => result),
    then: (
      onFulfilled?: (value: { data: unknown; error: unknown }) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => result.then(onFulfilled, onRejected),
  };
  return builder;
}

function setupAdminMocks() {
  adminFrom.mockImplementation((table: string) => {
    switch (table) {
      case "characters":
        return chain(() => queryResult(CHARACTER_ROW));
      case "character_spell_slots":
        return chain(() =>
          queryResult([{ slot_level: 1, max_slots: 0, used_slots: 0 }]),
        );
      case "character_classes":
        return chain(() => queryResult([]));
      case "v_character_traits":
        return chain(() =>
          queryResult([
            {
              trait_id: 1,
              trait_name: "Second Wind",
              source_type: "class",
              source_name: "Fighter",
              level_required: 1,
            },
          ]),
        );
      case "character_resources":
        return chain(() =>
          queryResult([
            {
              trait_id: 1,
              resource_key: "second-wind",
              name: "Second Wind",
              max_uses: 1,
              used_uses: 0,
              reset_on: "Short Rest",
            },
          ]),
        );
      case "skills":
        return chain(() =>
          queryResult([
            { name: "Athletics", base_attribute: "STR" },
            { name: "Perception", base_attribute: "WIS" },
          ]),
        );
      case "character_proficiencies":
        return chain(() =>
          queryResult([
            {
              proficiency_type: "armor",
              tool_id: null,
              name: "Heavy Armor",
              source_type: "class",
              source_id: 1,
              tools: null,
            },
          ]),
        );
      case "character_spells":
        return chain(() =>
          queryResult([
            {
              source_type: "class",
              is_prepared: true,
              always_prepared: false,
              spells: {
                id: 9,
                name: "Shield",
                level: 1,
                school: "Abjuration",
                casting_time: "1 reaction",
                range_text: "Self",
                components: "V,S",
                material_component: null,
                duration_text: "1 round",
                requires_concentration: false,
                requires_ritual: false,
                save_attribute: null,
                attack_type: null,
              },
            },
          ]),
        );
      case "character_feats":
        return chain(() =>
          queryResult([
            {
              feat_id: 5,
              source_type: "background",
              source_id: 2,
              selection_key: null,
              notes: null,
              feats: { name: "Tough", category: "Origin" },
            },
          ]),
        );
      default:
        return chain(() => queryResult([]));
    }
  });
}

describe("getCharacterForUser", () => {
  beforeEach(() => {
    adminFrom.mockReset();
    adminRpc.mockReset();
    setupAdminMocks();
  });

  it("chama get_character_sheet e get_character_roll_context no client autenticado", async () => {
    const authClient = {
      rpc: vi.fn((name: string) => {
        if (name === "get_character_sheet") {
          return queryResult({
            summary: { armor_class: 18, max_hp: 45, current_hp: 45 },
            inventory: [
              {
                item_id: 1,
                name: "Longsword",
                quantity: 1,
                is_equipped: true,
                item_type: "Weapon",
              },
            ],
            active_effects: [],
            stat_modifiers: [],
            trait_options: [],
            trait_spell_choices: [],
          });
        }
        if (name === "get_character_roll_context") {
          return queryResult({
            abilities: { STR: { score: 16, modifier: 3 } },
            saving_throws: [
              { ability: "STR", modifier: 5, proficient: true },
            ],
            skills: [
              {
                skill: "Athletics",
                base_attribute: "STR",
                modifier: 5,
                proficient: true,
                expertise: false,
              },
            ],
            spellcasting: [],
            weapons: [
              {
                item_id: 1,
                name: "Longsword",
                is_equipped: true,
                attack_ability: "STR",
                attack_bonus: 6,
              },
            ],
            spell_slots: [
              {
                slot_level: 1,
                max_slots: 4,
                used_slots: 2,
                remaining: 2,
              },
            ],
          });
        }
        return queryResult(null);
      }),
    };

    const character = await getCharacterForUser(
      42,
      "user-1",
      authClient as unknown as Parameters<typeof getCharacterForUser>[2],
    );

    expect(authClient.rpc).toHaveBeenCalledWith("get_character_sheet", {
      p_character_id: 42,
    });
    expect(authClient.rpc).toHaveBeenCalledWith("get_character_roll_context", {
      p_character_id: 42,
    });
    expect(character?.name).toBe("Aldric");
    expect(character?.abilities[0]?.score).toBe(16);
    expect(character?.inventory[0]?.name).toBe("Longsword");
    expect(character?.weapons[0]?.attack_bonus).toBe(6);
    expect(character?.traits[0]?.trait_name).toBe("Second Wind");
    expect(character?.resources[0]?.name).toBe("Second Wind");
    expect(character?.known_spells[0]?.name).toBe("Shield");
    expect(character?.spell_slots).toEqual([
      { slot_level: 1, max_slots: 4, used_slots: 2 },
    ]);
    expect(character?.character_feats[0]?.name).toBe("Tough");
  });

  it("retorna arrays vazios de sheet/roll context sem auth client", async () => {
    const character = await getCharacterForUser(42, "user-1");

    expect(character?.inventory).toEqual([]);
    expect(character?.abilities).toEqual([]);
    expect(character?.weapons).toEqual([]);
    expect(character?.active_effects).toEqual([]);
    expect(character?.traits[0]?.trait_name).toBe("Second Wind");
    expect(character?.known_spells[0]?.name).toBe("Shield");
  });

  it("retorna null quando o personagem não pertence ao usuário", async () => {
    adminFrom.mockImplementation((table: string) => {
      if (table !== "characters") {
        return chain(() => queryResult([]));
      }
      return chain(() => queryResult(null));
    });

    const character = await getCharacterForUser(99, "user-1");
    expect(character).toBeNull();
  });
});
