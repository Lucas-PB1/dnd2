import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ABILITY_LABELS } from "@/features/character-builder/components/shared/BuilderParts";
import {
  adjustPointBuyScore,
  pointBuyRemaining,
} from "@/features/character-builder/domain/abilities/abilities";
import { ABILITY_KEYS } from "@/features/character-builder/types/builder.types";
import type { AbilityStepProps } from "./types";

export function PointBuyBoard({ state, onChange }: AbilityStepProps) {
  const remaining = pointBuyRemaining(state.ability_assignment);

  return (
    <div className="space-y-3">
      <p className={`text-sm ${remaining === 0 ? "text-brand" : "text-muted"}`}>
        Pontos: <strong>{remaining}</strong> / 27
      </p>
      <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-3">
        {ABILITY_KEYS.map((key) => {
          const score = state.ability_assignment[key] ?? 8;
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
                <p className="shrink-0 text-xl font-semibold tabular-nums">{score}</p>
              </div>
              <div className="mt-2 flex gap-1.5">
                {[-1, 1].map((delta) => (
                  <Button
                    key={delta}
                    type="button"
                    variant="secondary"
                    size="md"
                    fullWidth={false}
                    className="min-w-10 px-3"
                    aria-label={`${delta < 0 ? "Diminuir" : "Aumentar"} ${ABILITY_LABELS[key]}`}
                    onClick={() => {
                      const next = adjustPointBuyScore(
                        state.ability_assignment,
                        key,
                        delta,
                      );
                      if (next) onChange({ ...state, ability_assignment: next });
                    }}
                  >
                    {delta < 0 ? (
                      <Minus className="size-4" aria-hidden />
                    ) : (
                      <Plus className="size-4" aria-hidden />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
