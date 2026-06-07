"use client";

import { Button } from "@/components/ui/Button";
import {
  ABILITY_LABELS,
  ChipToggle,
} from "@/features/character/components/builder/BuilderParts";
import {
  ABILITY_KEYS,
  STANDARD_ARRAY,
  type CharacterBuilderState,
} from "@/features/character/types/builder.types";
import {
  addRollSet,
  assignAbilityScore,
  selectRollSet,
  selectedRollSet,
  setAbilityMethod,
} from "@/features/character/hooks/useCharacterBuilder";
import {
  abilityModifier,
  adjustPointBuyScore,
  pointBuyRemaining,
} from "@/lib/character/abilities";
import {
  MAX_ROLL_ATTEMPTS,
  ROLL_MAX_TOTAL,
  ROLL_MIN_TOTAL,
  isRollSetValid,
  rollSetTotal,
} from "@/lib/character/ability-generation";
import type { AbilityMethod } from "@/features/character/types/builder.types";

type StepAbilitiesProps = {
  state: CharacterBuilderState;
  onChange: (next: CharacterBuilderState) => void;
};

const METHODS: { id: AbilityMethod; label: string; hint: string }[] = [
  { id: "standard", label: "Array padrão", hint: "15, 14, 13, 12, 10 e 8" },
  {
    id: "point_buy",
    label: "Compra de pontos",
    hint: "27 pontos · atributos de 8 a 15",
  },
  {
    id: "roll",
    label: "4d6 (descarta o menor)",
    hint: "Até 3 rolagens · soma entre 72 e 80",
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

  const usedScores = ABILITY_KEYS.map((key) => state.ability_assignment[key]).filter(
    (value): value is number => value !== null,
  );
  const usedCounts = usedScores.reduce<Record<number, number>>((acc, score) => {
    acc[score] = (acc[score] ?? 0) + 1;
    return acc;
  }, {});

  const availableScores = Object.entries(poolCounts).flatMap(([score, count]) => {
    const remaining = count - (usedCounts[Number(score)] ?? 0);
    return Array.from({ length: remaining }, () => Number(score));
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {availableScores.map((score, index) => (
          <span
            key={`${score}-${index}`}
            className="rounded-lg border border-dashed border-border px-3 py-1.5 text-sm text-muted"
          >
            {score} disponível
          </span>
        ))}
        {availableScores.length === 0 ? (
          <span className="text-sm text-brand">Todos os valores atribuídos</span>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ABILITY_KEYS.map((key) => {
          const score = state.ability_assignment[key];
          return (
            <div
              key={key}
              className="rounded-xl border border-border bg-surface/40 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">{key}</p>
                  <p className="font-medium text-foreground">{ABILITY_LABELS[key]}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold tabular-nums text-foreground">
                    {score ?? "—"}
                  </p>
                  {score ? (
                    <p className="text-sm text-muted">{formatModifier(score)}</p>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[...new Set(pool)].map((value) => {
                  const poolMax = poolCounts[value] ?? 0;
                  const usedForValue = ABILITY_KEYS.filter(
                    (k) => state.ability_assignment[k] === value,
                  ).length;
                  const takenElsewhere =
                    usedForValue >= poolMax && score !== value;
                  const isCurrent = score === value;
                  return (
                    <ChipToggle
                      key={value}
                      label={String(value)}
                      selected={isCurrent}
                      disabled={takenElsewhere && !isCurrent}
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
                {score !== null ? (
                  <ChipToggle
                    label="Limpar"
                    selected={false}
                    onToggle={() =>
                      onChange(assignAbilityScore(state, key, null))
                    }
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
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
    <div className="space-y-4">
      <p className={`text-sm ${remaining === 0 ? "text-brand" : "text-muted"}`}>
        Pontos restantes: <strong>{remaining}</strong> / 27
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ABILITY_KEYS.map((key) => {
          const score = state.ability_assignment[key] ?? 8;
          return (
            <div
              key={key}
              className="rounded-xl border border-border bg-surface/40 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">{key}</p>
                  <p className="font-medium text-foreground">{ABILITY_LABELS[key]}</p>
                </div>
                <p className="text-2xl font-semibold tabular-nums">{score}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="w-auto! min-w-11"
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
                  className="w-auto! min-w-11"
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

export function StepAbilities({ state, onChange }: StepAbilitiesProps) {
  const activeRollSet = selectedRollSet(state);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Método de geração
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {METHODS.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => onChange(setAbilityMethod(state, method.id))}
              className={`rounded-xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                state.ability_method === method.id
                  ? "border-brand bg-brand/10"
                  : "border-border bg-surface/40 hover:border-brand/40"
              }`}
            >
              <p className="font-medium text-foreground">{method.label}</p>
              <p className="mt-1 text-sm text-muted">{method.hint}</p>
            </button>
          ))}
        </div>
      </section>

      {state.ability_method === "standard" ? (
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground">
            Distribuir valores
          </h2>
          <p className="mt-1 text-sm text-muted">
            Atribua cada valor a um atributo.
          </p>
          <div className="mt-4">
            <AbilityBoard
              state={state}
              onChange={onChange}
              pool={[...STANDARD_ARRAY]}
            />
          </div>
        </section>
      ) : null}

      {state.ability_method === "point_buy" ? (
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground">
            Compra de pontos
          </h2>
          <div className="mt-4">
            <PointBuyBoard state={state} onChange={onChange} />
          </div>
        </section>
      ) : null}

      {state.ability_method === "roll" ? (
        <section className="space-y-6">
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Rolagem
            </h2>
            <p className="mt-1 text-sm text-muted">
              Role até {MAX_ROLL_ATTEMPTS} vezes. Só conjuntos com soma entre{" "}
              {ROLL_MIN_TOTAL} e {ROLL_MAX_TOTAL} podem ser usados.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4 w-auto!"
              disabled={state.roll_sets.length >= MAX_ROLL_ATTEMPTS}
              onClick={() => onChange(addRollSet(state))}
            >
              Rolar atributos ({state.roll_sets.length}/{MAX_ROLL_ATTEMPTS})
            </Button>
          </div>

          {state.roll_sets.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3">
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
                    className={`rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      selected
                        ? "border-brand bg-brand/10"
                        : valid
                          ? "border-border hover:border-brand/40"
                          : "border-border"
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">
                      Rolagem {index + 1}
                    </p>
                    <p className="mt-1 text-xs text-muted">{set.join(" · ")}</p>
                    <p
                      className={`mt-2 text-sm ${valid ? "text-brand" : "text-danger"}`}
                    >
                      Soma {total}{" "}
                      {valid
                        ? "· válida"
                        : `· inválida (${ROLL_MIN_TOTAL}–${ROLL_MAX_TOTAL})`}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : null}

          {activeRollSet ? (
            <div>
              <h3 className="font-medium text-foreground">
                Atribuir valores rolados
              </h3>
              <div className="mt-3">
                <AbilityBoard
                  state={state}
                  onChange={onChange}
                  pool={activeRollSet}
                />
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
