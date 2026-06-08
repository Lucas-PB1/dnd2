"use client";

import { useState } from "react";
import { Label } from "@/components/ui/Label";
import {
  ABILITY_LABELS,
  BuilderStepFrame,
  ChipToggle,
  SelectionOptionCard,
} from "@/features/character-builder/components/shared/BuilderParts";
import { BuilderDetailModal } from "@/features/character-builder/components/shared/BuilderDetailModal";
import { BackgroundDetailContent } from "@/features/character-builder/components/shared/builder-detail-content";
import {
  type AbilityKey,
  type BuilderBackgroundEntry,
  type CharacterBuilderData,
  type CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";
import {
  computePreviewAbilities,
  resetDependentState,
  updateBackgroundAsi,
} from "@/features/character-builder/hooks/useCharacterBuilder";
import { abilityModifier } from "@/features/character-builder/domain/abilities/abilities";

type StepBackgroundProps = {
  data: CharacterBuilderData;
  state: CharacterBuilderState;
  onChange: (patch: Partial<CharacterBuilderState> | CharacterBuilderState) => void;
};

function formatModifier(score: number): string {
  const mod = abilityModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function AbilityBonusToggle({
  abilityKey,
  value,
  selected,
  onToggle,
}: {
  abilityKey: AbilityKey;
  value?: number;
  selected: boolean;
  onToggle?: () => void;
}) {
  const interactive = Boolean(onToggle);
  const className = `flex h-8 min-w-0 items-center justify-between gap-2 rounded-md border px-2 text-sm transition-[background-color,border-color,color,box-shadow] ${
    interactive ? "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" : ""
  } ${
    selected
      ? "border-brand/45 bg-brand-glow/55 text-brand-soft shadow-[inset_0_1px_0_rgb(255_255_255/0.05)]"
      : "border-border bg-surface/30 text-muted hover:border-border-strong hover:bg-surface/60 hover:text-foreground"
  } ${interactive ? "cursor-pointer" : "cursor-default"}`;
  const content = (
    <>
      <span className="min-w-0 truncate">{ABILITY_LABELS[abilityKey]}</span>
      {value !== undefined ? (
        <span className="shrink-0 text-xs tabular-nums text-muted-subtle">
          {value} ({formatModifier(value)})
        </span>
      ) : null}
    </>
  );

  if (!interactive) {
    return <div className={className}>{content}</div>;
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={className}
    >
      {content}
    </button>
  );
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
        <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
          <div className="grid shrink-0 gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {data.backgrounds.map((entry) => (
              <SelectionOptionCard
                key={entry.id}
                compact
                selectedMarkPosition="leading"
                title={entry.name}
                facts={[
                  {
                    label: "Feat",
                    value: entry.origin_feat_name ?? "Sem feat",
                  },
                ]}
                selected={state.background_id === entry.id}
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
            <footer className="shrink-0 rounded-lg border border-border bg-background/25 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brand-soft">
                    Bônus do antecedente
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-subtle">
                    {background.ability_options
                      .map((k) => ABILITY_LABELS[k])
                      .join(", ")}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <ChipToggle
                    size="sm"
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
                    size="sm"
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
              </div>

              <div className="mt-3">
                {state.background_asi.mode === "split" ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs">+2</Label>
                      <div className="mt-1 grid gap-1.5">
                        {background.ability_options
                          .filter(
                            (key) =>
                              state.background_asi.plus2 === key ||
                              key !== state.background_asi.plus1,
                          )
                          .map((key) => {
                            const selected = state.background_asi.plus2 === key;
                            return (
                              <AbilityBonusToggle
                                key={`plus2-${key}`}
                                abilityKey={key}
                                value={preview?.[key]}
                                selected={selected}
                                onToggle={() =>
                                  onChange(
                                    updateBackgroundAsi(state, {
                                      plus2: selected ? null : key,
                                    }),
                                  )
                                }
                              />
                            );
                          })}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">+1</Label>
                      <div className="mt-1 grid gap-1.5">
                        {background.ability_options
                          .filter(
                            (key) =>
                              state.background_asi.plus1 === key ||
                              key !== state.background_asi.plus2,
                          )
                          .map((key) => {
                            const selected = state.background_asi.plus1 === key;
                            return (
                              <AbilityBonusToggle
                                key={`plus1-${key}`}
                                abilityKey={key}
                                value={preview?.[key]}
                                selected={selected}
                                onToggle={() =>
                                  onChange(
                                    updateBackgroundAsi(state, {
                                      plus1: selected ? null : key,
                                    }),
                                  )
                                }
                              />
                            );
                          })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label className="text-xs">+1 em cada atributo</Label>
                    <div className="mt-1 grid gap-1.5 sm:grid-cols-3">
                      {background.ability_options.map((key) => (
                        <AbilityBonusToggle
                          key={`even-${key}`}
                          abilityKey={key}
                          value={preview?.[key]}
                          selected
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </footer>
          ) : null}
        </div>
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
