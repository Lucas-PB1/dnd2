"use client";

import { useState } from "react";
import { Label } from "@/components/ui/Label";
import {
  ABILITY_LABELS,
  BuilderStepFrame,
  ChipToggle,
  SelectionCard,
  selectClassName,
} from "@/features/character/components/builder/BuilderParts";
import { BuilderDetailModal } from "@/features/character/components/builder/BuilderDetailModal";
import { BackgroundDetailContent } from "@/features/character/components/builder/builder-detail-content";
import {
  ABILITY_KEYS,
  type AbilityKey,
  type BuilderBackgroundEntry,
  type CharacterBuilderData,
  type CharacterBuilderState,
} from "@/features/character/types/builder.types";
import {
  computePreviewAbilities,
  resetDependentState,
  updateBackgroundAsi,
} from "@/features/character/hooks/useCharacterBuilder";
import { abilityModifier } from "@/lib/character/abilities";

type StepBackgroundProps = {
  data: CharacterBuilderData;
  state: CharacterBuilderState;
  onChange: (patch: Partial<CharacterBuilderState> | CharacterBuilderState) => void;
};

function formatModifier(score: number): string {
  const mod = abilityModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function StepBackground({ data, state, onChange }: StepBackgroundProps) {
  const [modalBackground, setModalBackground] =
    useState<BuilderBackgroundEntry | null>(null);

  const background = data.backgrounds.find((b) => b.id === state.background_id);
  const preview = computePreviewAbilities(data, state);

  return (
    <>
      <BuilderStepFrame
        title="Antecedente"
        hint="Escolha o histórico do personagem e distribua os bônus de atributo."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {data.backgrounds.map((entry) => (
            <SelectionCard
              key={entry.id}
              compact
              title={entry.name}
              description={entry.description}
              selected={state.background_id === entry.id}
              facts={
                entry.origin_feat_name
                  ? [{ label: "Feat", value: entry.origin_feat_name }]
                  : undefined
              }
              onInfo={() => setModalBackground(entry)}
              onSelect={() =>
                onChange(
                  resetDependentState(
                    {
                      ...state,
                      background_id: entry.id,
                      background_asi: {
                        mode: "split",
                        plus2: null,
                        plus1: null,
                      },
                    },
                    2,
                  ),
                )
              }
            />
          ))}
        </div>

        {background && background.ability_options.length > 0 ? (
          <footer className="mt-4 shrink-0 space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium text-muted">
              Bônus do antecedente (
              {background.ability_options
                .map((k) => ABILITY_LABELS[k])
                .join(", ")}
              )
            </p>
            <div className="flex flex-wrap gap-2">
              <ChipToggle
                label="+2 / +1"
                selected={state.background_asi.mode === "split"}
                onToggle={() =>
                  onChange(
                    updateBackgroundAsi(state, {
                      mode: "split",
                      plus2: null,
                      plus1: null,
                    }),
                  )
                }
              />
              <ChipToggle
                label="+1 cada"
                selected={state.background_asi.mode === "even"}
                onToggle={() =>
                  onChange(
                    updateBackgroundAsi(state, {
                      mode: "even",
                      plus2: null,
                      plus1: null,
                    }),
                  )
                }
              />
            </div>

            {state.background_asi.mode === "split" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>+2</Label>
                  <select
                    value={state.background_asi.plus2 ?? ""}
                    onChange={(e) =>
                      onChange(
                        updateBackgroundAsi(state, {
                          plus2: (e.target.value as AbilityKey) || null,
                        }),
                      )
                    }
                    className={selectClassName}
                  >
                    <option value="">Selecione…</option>
                    {background.ability_options.map((key) => (
                      <option
                        key={key}
                        value={key}
                        disabled={key === state.background_asi.plus1}
                      >
                        {ABILITY_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>+1</Label>
                  <select
                    value={state.background_asi.plus1 ?? ""}
                    onChange={(e) =>
                      onChange(
                        updateBackgroundAsi(state, {
                          plus1: (e.target.value as AbilityKey) || null,
                        }),
                      )
                    }
                    className={selectClassName}
                  >
                    <option value="">Selecione…</option>
                    {background.ability_options.map((key) => (
                      <option
                        key={key}
                        value={key}
                        disabled={key === state.background_asi.plus2}
                      >
                        {ABILITY_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}

            {preview ? (
              <div className="flex flex-wrap gap-1.5">
                {ABILITY_KEYS.map((key) => (
                  <span
                    key={key}
                    className="rounded-md bg-surface-elevated px-2 py-1 text-xs"
                  >
                    {ABILITY_LABELS[key]} {preview[key]} (
                    {formatModifier(preview[key])})
                  </span>
                ))}
              </div>
            ) : null}
          </footer>
        ) : null}
      </BuilderStepFrame>

      <BuilderDetailModal
        open={modalBackground !== null}
        title={modalBackground?.name ?? ""}
        onClose={() => setModalBackground(null)}
      >
        {modalBackground ? (
          <BackgroundDetailContent background={modalBackground} />
        ) : null}
      </BuilderDetailModal>
    </>
  );
}
