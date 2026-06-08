import { describe, expect, it } from "vitest";
import {
  filterPassiveClassTraits,
  formatProficiencyBonus,
  formatResourceUses,
  groupTraitsBySource,
} from "@/features/character-sheet/domain/sheet-display";

describe("filterPassiveClassTraits", () => {
  it("filtra só class/subclass e ordena por nível", () => {
    const traits = filterPassiveClassTraits([
      { trait_id: 1, trait_name: "Rage", source_type: "class", source_name: "Barbarian", level_required: 1 },
      { trait_id: 2, trait_name: "Frenzy", source_type: "subclass", source_name: "Barbarian: Berserker", level_required: 3 },
      { trait_id: 3, trait_name: "Darkvision", source_type: "species", source_name: "Dwarf", level_required: null },
    ]);

    expect(traits).toHaveLength(2);
    expect(traits[0].trait_name).toBe("Rage");
    expect(traits[1].trait_name).toBe("Frenzy");
  });
});

describe("groupTraitsBySource", () => {
  it("agrupa por source_name", () => {
    const groups = groupTraitsBySource([
      { trait_id: 1, trait_name: "Rage", source_type: "class", source_name: "Barbarian", level_required: 1 },
      { trait_id: 2, trait_name: "Frenzy", source_type: "subclass", source_name: "Barbarian: Berserker", level_required: 3 },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].traits).toHaveLength(1);
  });
});

describe("formatProficiencyBonus", () => {
  it("formata com sinal positivo", () => {
    expect(formatProficiencyBonus(3)).toBe("+3");
  });
});

describe("formatResourceUses", () => {
  it("mostra restantes/máximo", () => {
    expect(formatResourceUses({
      trait_id: 1,
      resource_key: "rage",
      name: "Rage",
      max_uses: 3,
      used_uses: 1,
      reset_on: "Short Rest",
    })).toBe("2/3");
  });
});
