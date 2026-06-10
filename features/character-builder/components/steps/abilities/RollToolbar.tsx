import { Dice5 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { addRollSet, selectRollSet } from "@/features/character-builder/hooks/useCharacterBuilder";
import {
  MAX_ROLL_ATTEMPTS,
  ROLL_MAX_TOTAL,
  ROLL_MIN_TOTAL,
  isRollSetValid,
  rollSetTotal,
} from "@/features/character-builder/domain/abilities/ability-generation";
import type { AbilityStepProps } from "./types";

export function RollToolbar({ state, onChange }: AbilityStepProps) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        size="md"
        fullWidth={false}
        icon={<Dice5 className="size-4" />}
        className="shrink-0"
        disabled={state.roll_sets.length >= MAX_ROLL_ATTEMPTS}
        onClick={() => onChange(addRollSet(state))}
      >
        Rolar ({state.roll_sets.length}/{MAX_ROLL_ATTEMPTS})
      </Button>

      {state.roll_sets.map((set, index) => {
        const total = rollSetTotal(set);
        const valid = isRollSetValid(set);
        const selected = state.selected_roll_index === index;
        return (
          <button
            key={index}
            type="button"
            disabled={!valid}
            onClick={() => onChange(selectRollSet(state, index))}
            className={`shrink-0 rounded-lg border px-3 py-1.5 text-left text-sm transition-[background-color,border-color,color] disabled:opacity-50 ${
              selected
                ? "border-brand/45 bg-brand-glow/45"
                : "border-border bg-surface/30 hover:border-brand/35 hover:bg-surface/55"
            }`}
          >
            <span className="font-medium">#{index + 1}</span>{" "}
            <span className="text-muted">{set.join(", ")}</span>{" "}
            <span className={valid ? "text-brand" : "text-danger"}>
              Σ {total}
            </span>
          </button>
        );
      })}

      <span className="text-xs text-muted">
        Soma válida: {ROLL_MIN_TOTAL}–{ROLL_MAX_TOTAL}
      </span>
    </div>
  );
}
