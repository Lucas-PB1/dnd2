import {
  ABILITY_LABELS,
  ChipToggle,
} from "@/features/character-builder/components/shared/BuilderParts";
import { assignAbilityScore } from "@/features/character-builder/hooks/useCharacterBuilder";
import { ABILITY_KEYS } from "@/features/character-builder/types/builder.types";
import { formatModifier } from "./ability-format";
import type { AbilityStepProps } from "./types";

type AbilityBoardProps = AbilityStepProps & {
  pool: number[];
};

export function AbilityBoard({ state, onChange, pool }: AbilityBoardProps) {
  const poolCounts = pool.reduce<Record<number, number>>((acc, score) => {
    acc[score] = (acc[score] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-3">
      {ABILITY_KEYS.map((key) => {
        const score = state.ability_assignment[key];
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
              {[...new Set(pool)]
                .filter((value) => {
                  const poolMax = poolCounts[value] ?? 0;
                  const usedForValue = ABILITY_KEYS.filter(
                    (abilityKey) => state.ability_assignment[abilityKey] === value,
                  ).length;
                  return usedForValue < poolMax || score === value;
                })
                .map((value) => {
                  const isCurrent = score === value;
                  return (
                    <ChipToggle
                      key={value}
                      size="sm"
                      label={String(value)}
                      selected={isCurrent}
                      onToggle={() =>
                        onChange(assignAbilityScore(state, key, isCurrent ? null : value))
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
