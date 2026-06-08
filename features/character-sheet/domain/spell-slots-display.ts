import type {
  CharacterSpellSlot,
  CharacterSpellcastingInfo,
} from "@/features/character-sheet/types/character.types";

export function spellSlotsSectionTitle(
  spellcasting: CharacterSpellcastingInfo,
): string {
  switch (spellcasting.progression_type) {
    case "pact":
      return "Magia de pacto";
    case "half":
      return "Slots de magia";
    default:
      return "Slots de magia";
  }
}

export function spellSlotsRecoveryHint(
  spellcasting: CharacterSpellcastingInfo,
): string {
  if (spellcasting.progression_type === "pact") {
    return "Recuperação em descanso curto ou longo (PHB 2024).";
  }
  if (spellcasting.slot_recovery === "Long Rest") {
    return "Recuperação em descanso longo.";
  }
  return spellcasting.slot_recovery;
}

export function formatSpellSlotLine(slot: CharacterSpellSlot): string {
  const remaining = slot.max_slots - slot.used_slots;
  const levelLabel = `${slot.slot_level}º`;
  if (slot.max_slots === 1) {
    return `1 slot (${levelLabel}) · ${remaining} disponível`;
  }
  return `${slot.max_slots} slots (${levelLabel}) · ${remaining} disponíveis`;
}

export function formatSpellSlotsCompact(
  slots: CharacterSpellSlot[],
): string | null {
  if (slots.length === 0) return null;
  return slots
    .map(
      (slot) =>
        `${slot.max_slots - slot.used_slots}/${slot.max_slots}×${slot.slot_level}º`,
    )
    .join(" · ");
}
