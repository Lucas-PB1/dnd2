"use client";

import { Button } from "@/components/ui/Button";
import {
  ABILITY_LABELS,
  BuilderStepFrame,
  ChipToggle,
} from "@/features/character-builder/components/shared/BuilderParts";
import {
  ABILITY_KEYS,
  STANDARD_ARRAY,
  type CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";
import {
  addRollSet,
  assignAbilityScore,
  assignRolledSlot,
  selectRollSet,
  selectedRollSet,
  setAbilityMethod,
} from "@/features/character-builder/hooks/useCharacterBuilder";
import {
  abilityModifier,
  adjustPointBuyScore,
  pointBuyRemaining,
} from "@/features/character-builder/domain/abilities/abilities";
import {
  MAX_ROLL_ATTEMPTS,
  ROLL_MAX_TOTAL,
  ROLL_MIN_TOTAL,
  isRollSetValid,
  rollSetTotal,
} from "@/features/character-builder/domain/abilities/ability-generation";
import type { AbilityMethod } from "@/features/character-builder/types/builder.types";

type StepAbilitiesProps = {
  state: CharacterBuilderState;
  onChange: (next: CharacterBuilderState) => void;
};

const METHODS: { id: AbilityMethod; label: string; hint: string }[] = [
  { id: "standard", label: "Array padrão", hint: "15, 14, 13, 12, 10 e 8" },
  {
    id: "point_buy",
    label: "Compra de pontos",
    hint: "27 pontos · 8 a 15",
  },
  {
    id: "roll",
    label: "4d6 (descarta menor)",
    hint: "Até 3 rolagens · soma 72–80",
  },
];

function formatModifier(score: number): string {
  const mod = abilityModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function AbilityBoard({
  state,
  onChange,
  pool,
}: {
  state: CharacterBuilderState;
  onChange: (next: CharacterBuilderState) => void;
  pool: number[];
}) {
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
            className="min-w-0 rounded-xl border border-border bg-surface/40 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0" title={ABILITY_LABELS[key]}>
                <p className="text-xs font-semibold uppercase text-muted">
                  {key}
                </p>
                <p className="truncate text-sm text-foreground">
                  {ABILITY_LABELS[key]}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xl font-semibold tabular-nums">
                  {score ?? "—"}
                </p>
                {score ? (
                  <p className="text-xs text-muted">{formatModifier(score)}</p>
                ) : null}
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
                        onChange(
                          assignAbilityScore(
                            state,
                            key,
                            isCurrent ? null : value,
                          ),
                        )
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

function RollAbilityBoard({
  state,
  onChange,
  pool,
}: {
  state: CharacterBuilderState;
  onChange: (next: CharacterBuilderState) => void;
  pool: number[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-3">
      {ABILITY_KEYS.map((key) => {
        const score = state.ability_assignment[key];
        const activeSlot = state.roll_slot_assignment[key];
        return (
          <div
            key={key}
            className="min-w-0 rounded-xl border border-border bg-surface/40 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0" title={ABILITY_LABELS[key]}>
                <p className="text-xs font-semibold uppercase text-muted">
                  {key}
                </p>
                <p className="truncate text-sm text-foreground">
                  {ABILITY_LABELS[key]}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xl font-semibold tabular-nums">
                  {score ?? "—"}
                </p>
                {score ? (
                  <p className="text-xs text-muted">{formatModifier(score)}</p>
                ) : null}
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
                        onChange(
                          assignRolledSlot(
                            state,
                            key,
                            isCurrent ? null : slotIndex,
                          ),
                        )
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

function PointBuyBoard({
  state,
  onChange,
}: {
  state: CharacterBuilderState;
  onChange: (next: CharacterBuilderState) => void;
}) {
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
              className="min-w-0 rounded-xl border border-border bg-surface/40 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0" title={ABILITY_LABELS[key]}>
                  <p className="text-xs font-semibold uppercase text-muted">
                    {key}
                  </p>
                  <p className="truncate text-sm text-foreground">
                    {ABILITY_LABELS[key]}
                  </p>
                </div>
                <p className="shrink-0 text-xl font-semibold tabular-nums">
                  {score}
                </p>
              </div>
              <div className="mt-2 flex gap-1.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="w-auto! min-w-10"
                  onClick={() => {
                    const next = adjustPointBuyScore(
                      state.ability_assignment,
                      key,
                      -1,
                    );
                    if (next) onChange({ ...state, ability_assignment: next });
                  }}
                >
                  −
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="w-auto! min-w-10"
                  onClick={() => {
                    const next = adjustPointBuyScore(
                      state.ability_assignment,
                      key,
                      1,
                    );
                    if (next) onChange({ ...state, ability_assignment: next });
                  }}
                >
                  +
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RollToolbar({
  state,
  onChange,
}: {
  state: CharacterBuilderState;
  onChange: (next: CharacterBuilderState) => void;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        size="md"
        className="w-auto! shrink-0"
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
            className={`shrink-0 rounded-lg border px-3 py-1.5 text-left text-sm transition-colors disabled:opacity-50 ${
              selected
                ? "border-brand bg-brand/10"
                : "border-border hover:border-brand/40"
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

export function StepAbilities({ state, onChange }: StepAbilitiesProps) {
  const activeRollSet = selectedRollSet(state);

  return (
    <BuilderStepFrame
      title="Atributos"
      hint="Escolha o método e distribua os valores entre os seis atributos."
    >
      <div className="flex min-h-0 min-w-0 flex-col gap-3">
        <div className="grid shrink-0 grid-cols-3 gap-2">
          {METHODS.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => onChange(setAbilityMethod(state, method.id))}
              className={`min-w-0 rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                state.ability_method === method.id
                  ? "border-brand bg-brand/10"
                  : "border-border bg-surface/40 hover:border-brand/40"
              }`}
            >
              <p className="text-sm font-medium text-foreground">
                {method.label}
              </p>
              <p className="mt-1 text-xs text-muted">{method.hint}</p>
            </button>
          ))}
        </div>

        {state.ability_method === "standard" ? (
          <AbilityBoard
            state={state}
            onChange={onChange}
            pool={[...STANDARD_ARRAY]}
          />
        ) : null}

        {state.ability_method === "point_buy" ? (
          <PointBuyBoard state={state} onChange={onChange} />
        ) : null}

        {state.ability_method === "roll" ? (
          <div className="flex min-h-0 flex-col gap-3">
            <RollToolbar state={state} onChange={onChange} />
            {activeRollSet ? (
              <RollAbilityBoard
                state={state}
                onChange={onChange}
                pool={activeRollSet}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </BuilderStepFrame>
  );
}
