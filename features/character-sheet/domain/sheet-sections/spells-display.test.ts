import { describe, expect, it } from "vitest";
import {
  groupKnownSpells,
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

  it("usa prepared_count da tabela D&D 2024 quando disponível", () => {
    const character = wizardCharacterFixture();

    expect(preparedSpellSummary(
      character.known_spells,
      character.spellcasting_entries,
    )).toBe("2/9 preparadas");
  });

  it("omite limite quando o banco não retorna prepared_count", () => {
    const character = wizardCharacterFixture({
      spellcasting_entries: wizardCharacterFixture().spellcasting_entries.map(
        (entry) => ({ ...entry, prepared_count: null }),
      ),
    });

    expect(preparedSpellSummary(
      character.known_spells,
      character.spellcasting_entries,
    )).toBe("2 preparadas");
  });
});
