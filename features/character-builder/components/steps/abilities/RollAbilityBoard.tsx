import {
  ABILITY_LABELS,
  ChipToggle,
} from "@/features/character-builder/components/shared/BuilderParts";
import { assignRolledSlot } from "@/features/character-builder/hooks/useCharacterBuilder";
import { ABILITY_KEYS } from "@/features/character-builder/types/builder.types";
import { formatModifier } from "./ability-format";
import type { AbilityStepProps } from "./types";

type RollAbilityBoardProps = AbilityStepProps & {
  pool: number[];
};

export function RollAbilityBoard({ state, onChange, pool }: RollAbilityBoardProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-3">
      {ABILITY_KEYS.map((key) => {
        const score = state.ability_assignment[key];
        const activeSlot = state.roll_slot_assignment[key];
        return (
          <div
            key={key}
            className="min-w-0 rounded-lg border border-border bg-surface/40 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.035)]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0" title={ABILITY_LABELS[key]}>
                <p className="text-xs font-semibold uppercase text-muted">{key}</p>
                <p className="truncate text-sm text-foreground">{ABILITY_LABELS[key]}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xl font-semibold tabular-nums">{score ?? "—"}</p>
                {score ? <p className="text-xs text-muted">{formatModifier(score)}</p> : null}
              </div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1">
              {pool
                .map((value, slotIndex) => ({ value, slotIndex }))
                .filter(({ slotIndex }) => {
                  const slotOwner = ABILITY_KEYS.find(
                    (abilityKey) =>
                      state.roll_slot_assignment[abilityKey] === slotIndex,
                  );
                  return slotOwner === undefined || slotOwner === key;
                })
                .map(({ value, slotIndex }) => {
                  const isCurrent = activeSlot === slotIndex;
                  return (
                    <ChipToggle
                      key={`${key}-slot-${slotIndex}`}
                      size="sm"
                      label={String(value)}
                      selected={isCurrent}
                      onToggle={() =>
                        onChange(assignRolledSlot(state, key, isCurrent ? null : slotIndex))
                      }
                    />
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
