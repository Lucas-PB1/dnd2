import { describe, expect, it } from "vitest";
import {
  groupKnownSpells,
  maxPreparedSpellCount,
  preparedSpellSummary,
} from "@/features/character-sheet/domain/sheet-sections/spells-display";
import { wizardCharacterFixture } from "@/features/character-sheet/test-fixtures/character-detail.fixture";

describe("spells-display", () => {
  it("agrupa magias de Mago L5 em truques, preparadas e grimório", () => {
    const character = wizardCharacterFixture();
    const groups = groupKnownSpells(character.known_spells);

    expect(groups.map((group) => group.key)).toEqual([
      "cantrips",
      "prepared",
      "spellbook",
    ]);
    expect(groups.find((g) => g.key === "cantrips")?.spells).toHaveLength(1);
    expect(groups.find((g) => g.key === "prepared")?.spells).toHaveLength(2);
    expect(groups.find((g) => g.key === "spellbook")?.spells).toHaveLength(2);
  });

  it("calcula máximo de preparadas por atributo + nível de classe", () => {
    const character = wizardCharacterFixture();
    const entry = character.spellcasting_entries[0]!;

    expect(maxPreparedSpellCount(entry, character.abilities)).toBe(5);
    expect(preparedSpellSummary(
      character.known_spells,
      character.spellcasting_entries,
      character.abilities,
    )).toBe("2/5 preparadas");
  });
});
