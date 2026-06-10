import { Surface } from "@/components/ui/Surface";
import type {
  CharacterSpellSlot,
  CharacterSpellcastingInfo,
} from "@/shared/character";
import {
  formatSpellSlotLine,
  formatSpellSlotsCompact,
  spellSlotsRecoveryHint,
  spellSlotsSectionTitle,
} from "@/features/character-sheet/domain/spell-slots-display";

type CharacterSpellSlotsSectionProps = {
  spellcasting: CharacterSpellcastingInfo;
  slots: CharacterSpellSlot[];
  multiclassNote?: string | null;
};

export function CharacterSpellSlotsSection({
  spellcasting,
  slots,
  multiclassNote,
}: CharacterSpellSlotsSectionProps) {
  if (slots.length === 0) return null;

  const compact = formatSpellSlotsCompact(slots);

  return (
    <Surface className="p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-foreground">
          {spellSlotsSectionTitle(spellcasting)}
        </h2>
        {compact ? (
          <p className="text-sm font-medium text-brand">{compact}</p>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-muted">
        {spellcasting.class_name} · {spellSlotsRecoveryHint(spellcasting)}
      </p>
      {multiclassNote ? (
        <p className="mt-2 text-xs text-muted-subtle">{multiclassNote}</p>
      ) : null}
      <ul className="mt-4 space-y-2">
        {slots.map((slot) => (
          <li
            key={slot.slot_level}
            className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-surface/40 px-3 py-2 text-sm"
          >
            <span className="text-muted">{formatSpellSlotLine(slot)}</span>
            <span className="shrink-0 tabular-nums text-foreground">
              {slot.used_slots}/{slot.max_slots} usados
            </span>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
