import { describe, expect, it } from "vitest";
import {
  formatSpellSlotLine,
  formatSpellSlotsCompact,
  spellSlotsRecoveryHint,
  spellSlotsSectionTitle,
} from "@/features/character-sheet/domain/spell-slots-display";
import type { CharacterSpellcastingInfo } from "@/shared/character";

const warlockPact: CharacterSpellcastingInfo = {
  class_name: "Warlock",
  progression_type: "pact",
  slot_recovery: "Short Rest",
  spellcasting_ability: "CHA",
};

const paladinHalf: CharacterSpellcastingInfo = {
  class_name: "Paladin",
  progression_type: "half",
  slot_recovery: "Long Rest",
  spellcasting_ability: "CHA",
};

describe("spell-slots-display", () => {
  it("rotula magia de pacto para Warlock", () => {
    expect(spellSlotsSectionTitle(warlockPact)).toBe("Magia de pacto");
    expect(spellSlotsRecoveryHint(warlockPact)).toMatch(/descanso curto/i);
  });

  it("rotula slots half para Paladin", () => {
    expect(spellSlotsSectionTitle(paladinHalf)).toBe("Slots de magia");
    expect(spellSlotsRecoveryHint(paladinHalf)).toMatch(/descanso longo/i);
  });

  it("formata linha compacta de pact slots", () => {
    expect(
      formatSpellSlotsCompact([
        { slot_level: 3, max_slots: 2, used_slots: 0 },
      ]),
    ).toBe("2/2×3º");
  });

  it("formata linha detalhada com disponíveis", () => {
    expect(
      formatSpellSlotLine({ slot_level: 2, max_slots: 4, used_slots: 1 }),
    ).toBe("4 slots (2º) · 3 disponíveis");
  });
});
