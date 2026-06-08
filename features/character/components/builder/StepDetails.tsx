"use client";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  ABILITY_LABELS,
  BuilderStepFrame,
} from "@/features/character/components/builder/BuilderParts";
import {
  ABILITY_KEYS,
  type CharacterBuilderData,
  type CharacterBuilderState,
} from "@/features/character/types/builder.types";
import { computePreviewAbilities } from "@/features/character/hooks/useCharacterBuilder";
import { abilityModifier } from "@/lib/character/abilities";

type StepDetailsProps = {
  data: CharacterBuilderData;
  state: CharacterBuilderState;
  onChange: (patch: Partial<CharacterBuilderState>) => void;
};

function formatModifier(score: number): string {
  const mod = abilityModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function StepDetails({ data, state, onChange }: StepDetailsProps) {
  const cls = data.classes.find((c) => c.id === state.class_id);
  const species = data.species.find((s) => s.id === state.species_id);
  const background = data.backgrounds.find((b) => b.id === state.background_id);
  const abilities = computePreviewAbilities(data, state);

  return (
    <BuilderStepFrame
      title="Detalhes finais"
      hint="Nomeie seu personagem e confira o resumo antes de criar."
    >
      <div className="min-w-0 space-y-4">
        <div className="min-w-0">
          <Label htmlFor="character-name">Nome do personagem</Label>
          <Input
            id="character-name"
            value={state.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Aldric"
            maxLength={255}
            className="mt-1.5 w-full focus-visible:outline-offset-0"
            autoFocus
          />
        </div>

        <dl className="grid min-w-0 gap-2 rounded-xl border border-border bg-surface/40 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Classe</dt>
            <dd className="font-medium text-foreground">{cls?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Espécie</dt>
            <dd className="font-medium text-foreground">
              {species?.name ?? "—"}
              {state.size ? ` (${state.size})` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Antecedente</dt>
            <dd className="font-medium text-foreground">
              {background?.name ?? "—"}
            </dd>
          </div>
          {abilities ? (
            <div className="sm:col-span-2">
              <dt className="text-muted">Atributos finais</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {ABILITY_KEYS.map((key) => (
                  <span
                    key={key}
                    className="rounded-md bg-surface-elevated px-2 py-1 text-xs"
                  >
                    {ABILITY_LABELS[key]} {abilities[key]} (
                    {formatModifier(abilities[key])})
                  </span>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </BuilderStepFrame>
  );
}
