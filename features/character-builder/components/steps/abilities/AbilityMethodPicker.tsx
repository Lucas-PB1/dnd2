import { setAbilityMethod } from "@/features/character-builder/hooks/useCharacterBuilder";
import type { AbilityMethod } from "@/features/character-builder/types/builder.types";
import type { AbilityStepProps } from "./types";

const METHODS: { id: AbilityMethod; label: string; hint: string }[] = [
  { id: "standard", label: "Array padrão", hint: "15, 14, 13, 12, 10 e 8" },
  { id: "point_buy", label: "Compra de pontos", hint: "27 pontos · 8 a 15" },
  { id: "roll", label: "4d6 (descarta menor)", hint: "Até 3 rolagens · soma 72–80" },
];

export function AbilityMethodPicker({ state, onChange }: AbilityStepProps) {
  return (
    <div className="grid shrink-0 grid-cols-3 gap-2">
      {METHODS.map((method) => (
        <button
          key={method.id}
          type="button"
          onClick={() => onChange(setAbilityMethod(state, method.id))}
          className={`min-w-0 rounded-lg border p-3 text-left shadow-[inset_0_1px_0_rgb(255_255_255/0.035)] transition-[background-color,border-color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
            state.ability_method === method.id
              ? "border-brand/50 bg-brand-glow/45"
              : "border-border bg-surface/40 hover:border-brand/35 hover:bg-surface/62"
          }`}
        >
          <p className="text-sm font-medium text-foreground">{method.label}</p>
          <p className="mt-1 text-xs text-muted">{method.hint}</p>
        </button>
      ))}
    </div>
  );
}
