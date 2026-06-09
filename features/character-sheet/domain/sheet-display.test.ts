import { describe, expect, it } from "vitest";
import {
  abilityLabel,
  filterPassiveClassTraits,
  formatProficiencyBonus,
  formatResourceUses,
  groupAllTraitsBySource,
  groupProficiencies,
  groupTraitsBySource,
  passivePerception,
  sortSkills,
  spellLevelLabel,
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

describe("groupAllTraitsBySource", () => {
  it("mantém traços de espécie e feat na ficha completa", () => {
    const groups = groupAllTraitsBySource([
      { trait_id: 1, trait_name: "Darkvision", source_type: "species", source_name: "Elf", level_required: null },
      { trait_id: 2, trait_name: "Magic Initiate", source_type: "feat", source_name: "Sage", level_required: null },
    ]);

    expect(groups.map((group) => group.source)).toEqual(["Elf", "Sage"]);
  });
});

describe("formatProficiencyBonus", () => {
  it("formata com sinal positivo", () => {
    expect(formatProficiencyBonus(3)).toBe("+3");
  });
});

describe("abilityLabel", () => {
  it("traduz abreviação de atributo", () => {
    expect(abilityLabel("WIS")).toBe("Sabedoria");
  });
});

describe("sortSkills", () => {
  it("ordena por atributo e depois nome", () => {
    const sorted = sortSkills([
      { skill: "Arcana", base_attribute: "INT", modifier: 3 },
      { skill: "Athletics", base_attribute: "STR", modifier: 5 },
      { skill: "History", base_attribute: "INT", modifier: 2 },
    ]);

    expect(sorted.map((skill) => skill.skill)).toEqual([
      "Athletics",
      "Arcana",
      "History",
    ]);
  });
});

describe("passivePerception", () => {
  it("usa 10 + modificador de Perception", () => {
    expect(passivePerception([
      { skill: "Perception", base_attribute: "WIS", modifier: 6 },
    ])).toBe(16);
  });
});

describe("groupProficiencies", () => {
  it("agrupa e rotula proficiências", () => {
    const groups = groupProficiencies([
      { proficiency_type: "tool", name: "Lute" },
      { proficiency_type: "language", name: "Common" },
    ]);

    expect(groups.map((group) => group.label)).toEqual(["Ferramentas", "Idiomas"]);
  });
});

describe("spellLevelLabel", () => {
  it("rotula truques separadamente", () => {
    expect(spellLevelLabel(0)).toBe("Truque");
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
