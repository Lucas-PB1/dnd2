import { clampClassLevel } from "@/features/character-builder/domain/progression/levels";
import {
  spellcastingProgressionForClass,
  type SpellcastingProgression,
} from "@/features/character-builder/domain/progression/spell-progression";
import { SPELL_SLOT_TABLES } from "@/features/character-builder/domain/progression/spell-slots-data";

export type SpellSlotEntry = {
  slotLevel: number;
  count: number;
};

type ProgressionSlug = keyof typeof SPELL_SLOT_TABLES;

export function spellSlotsForProgression(
  progression: Exclude<SpellcastingProgression, "none">,
  classLevel: number,
): SpellSlotEntry[] {
  const level = clampClassLevel(classLevel);
  const progressionTable = SPELL_SLOT_TABLES[progression as ProgressionSlug];
  const table = progressionTable[String(level) as keyof typeof progressionTable];
  if (!table) return [];

  return Object.entries(table)
    .map(([slotLevel, count]) => ({
      slotLevel: Number(slotLevel),
      count: Number(count),
    }))
    .sort((a, b) => a.slotLevel - b.slotLevel);
}

export function spellSlotsForClass(
  className: string,
  classLevel: number,
): SpellSlotEntry[] {
  const progression = spellcastingProgressionForClass(className);
  if (progression === "none") return [];
  return spellSlotsForProgression(progression, classLevel);
}

export function formatSpellSlotsPreview(slots: SpellSlotEntry[]): string | null {
  if (slots.length === 0) return null;
  return slots.map(({ slotLevel, count }) => `${count}×${slotLevel}º`).join(" · ");
}
