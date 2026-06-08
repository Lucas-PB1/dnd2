"use client";

import { useState } from "react";
import { Check, Info } from "lucide-react";
import { Label } from "@/components/ui/Label";
import {
  ABILITY_LABELS,
  BuilderStepFrame,
  ChipToggle,
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

function BackgroundOptionCard({
  entry,
  selected,
  onSelect,
  onInfo,
}: {
  entry: BuilderBackgroundEntry;
  selected: boolean;
  onSelect: () => void;
  onInfo: () => void;
}) {
  return (
    <div className="relative min-w-0">
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className={`group relative min-h-16 w-full overflow-hidden rounded-lg border py-2 pr-10 text-left shadow-[inset_0_1px_0_rgb(255_255_255/0.035)] transition-[background-color,border-color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          selected ? "pl-9" : "pl-3"
        } ${
          selected
            ? "border-brand/55 bg-brand-glow/42 shadow-[inset_0_1px_0_rgb(255_255_255/0.05),0_8px_22px_rgb(0_0_0/0.16)]"
            : "border-border bg-surface/35 hover:border-brand/30 hover:bg-surface/56 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.045)]"
        }`}
      >
        <span
          aria-hidden
          className={`absolute inset-y-2 left-0 w-0.5 rounded-r-full transition-colors ${
            selected ? "bg-brand" : "bg-transparent group-hover:bg-brand/30"
          }`}
        />
        {selected ? (
          <span
            aria-hidden
            className="absolute left-3 top-2.5 flex size-5 items-center justify-center rounded-full border border-brand bg-brand text-on-brand shadow-[0_0_0_2px_rgb(219_166_73/0.12)]"
          >
            <Check className="size-3" aria-hidden />
          </span>
        ) : null}
        <span className="block min-w-0">
          <span className="block truncate text-sm font-semibold text-foreground">
            {entry.name}
          </span>
          {entry.origin_feat_name ? (
            <span className="mt-1 inline-flex max-w-full items-center rounded-md border border-border-muted bg-surface-elevated/70 px-2 py-0.5 text-[11px] leading-none text-muted-subtle transition-colors group-hover:border-border-strong group-hover:text-muted">
              <span className="truncate">{entry.origin_feat_name}</span>
            </span>
          ) : (
            <span className="mt-1 block text-xs text-muted-subtle">
              Sem feat
            </span>
          )}
        </span>
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onInfo();
        }}
        aria-label={`Detalhes: ${entry.name}`}
        className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full border border-border bg-surface-elevated/80 text-muted transition-[background-color,border-color,color] hover:border-accent/50 hover:bg-accent-muted/20 hover:text-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Info className="size-3.5" aria-hidden />
      </button>
    </div>
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
              <BackgroundOptionCard
                key={entry.id}
                entry={entry}
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
