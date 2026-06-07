"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/motion";
import {
  ABILITY_LABELS,
  BuilderStepper,
  ChipToggle,
  SelectionCard,
  selectClassName,
} from "@/features/character/components/builder/BuilderParts";
import { StepAbilities } from "@/features/character/components/builder/StepAbilities";
import {
  ABILITY_KEYS,
  BUILDER_STEPS,
  type AbilityKey,
  type CharacterBuilderData,
  type CharacterBuilderState,
  type CharacterBuilderSummary,
} from "@/features/character/types/builder.types";
import {
  canAdvance,
  computePreviewAbilities,
  createInitialBuilderState,
  resetDependentState,
  selectionKey,
  setBackgroundTool,
  setClassTool,
  toggleClassSkill,
  toggleOriginFeatTraitOption,
  toggleSpeciesTraitOption,
  updateBackgroundAsi,
  validateBuilderStep,
} from "@/features/character/hooks/useCharacterBuilder";
import {
  abilityModifier,
  parseSizeOptions,
} from "@/lib/character/abilities";
import {
  createCharacterFromBuilder,
  fetchCharacterBuilderDetails,
  fetchCharacterBuilderSummary,
  mergeBuilderCatalog,
} from "@/features/character/services/character.service";

function formatModifier(score: number): string {
  const mod = abilityModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function StepClass({
  data,
  state,
  onChange,
}: {
  data: CharacterBuilderData;
  state: CharacterBuilderState;
  onChange: (patch: Partial<CharacterBuilderState> | CharacterBuilderState) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Escolha a classe de nível 1. Perícias e proficiências fixas são aplicadas
        automaticamente.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.classes.map((cls) => (
          <SelectionCard
            key={cls.id}
            title={cls.name}
            description={`Dado de vida ${cls.hit_die} · Salvaguardas: ${cls.saving_throws.join(", ") || "—"}`}
            selected={state.class_id === cls.id}
            onSelect={() =>
              onChange(
                resetDependentState({ ...state, class_id: cls.id }, 2),
              )
            }
            meta={
              cls.weapons.length > 0 ? (
                <span>Armas: {cls.weapons.slice(0, 4).join(", ")}</span>
              ) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}

function StepOrigin({
  data,
  state,
  onChange,
}: {
  data: CharacterBuilderData;
  state: CharacterBuilderState;
  onChange: (patch: Partial<CharacterBuilderState> | CharacterBuilderState) => void;
}) {
  const species = data.species.find((s) => s.id === state.species_id);
  const background = data.backgrounds.find((b) => b.id === state.background_id);
  const sizes = species ? parseSizeOptions(species.size_options) : [];
  const preview = computePreviewAbilities(data, state);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Espécie
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {data.species.map((entry) => (
            <SelectionCard
              key={entry.id}
              title={entry.name}
              description={entry.description}
              selected={state.species_id === entry.id}
              onSelect={() =>
                onChange(
                  resetDependentState(
                    {
                      ...state,
                      species_id: entry.id,
                      size:
                        parseSizeOptions(entry.size_options).length === 1
                          ? parseSizeOptions(entry.size_options)[0]
                          : null,
                    },
                    1,
                  ),
                )
              }
              meta={`${entry.creature_type} · ${entry.size_options} · ${entry.base_speed} pés`}
            />
          ))}
        </div>
      </section>

      {sizes.length > 1 ? (
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground">
            Tamanho
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <ChipToggle
                key={size}
                label={size}
                selected={state.size === size}
                onToggle={() => onChange({ size })}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Antecedente
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {data.backgrounds.map((entry) => (
            <SelectionCard
              key={entry.id}
              title={entry.name}
              description={entry.description}
              selected={state.background_id === entry.id}
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
                    1,
                  ),
                )
              }
              meta={
                entry.origin_feat_name
                  ? `Feat: ${entry.origin_feat_name}`
                  : undefined
              }
            />
          ))}
        </div>
      </section>

      {background && background.ability_options.length > 0 ? (
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground">
            Bônus do antecedente
          </h2>
          <p className="mt-1 text-sm text-muted">
            Atributos oferecidos:{" "}
            {background.ability_options
              .map((k) => ABILITY_LABELS[k])
              .join(", ")}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <ChipToggle
              label="+2 em um, +1 em outro"
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
              label="+1 em cada um"
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
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
            <div className="mt-4 flex flex-wrap gap-2">
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
        </section>
      ) : null}
    </div>
  );
}


function StepChoices({
  data,
  state,
  onChange,
}: {
  data: CharacterBuilderData;
  state: CharacterBuilderState;
  onChange: (next: CharacterBuilderState) => void;
}) {
  const cls = data.classes.find((c) => c.id === state.class_id);
  const species = data.species.find((s) => s.id === state.species_id);
  const background = data.backgrounds.find((b) => b.id === state.background_id);

  if (!cls || !species || !background) {
    return (
      <p className="text-sm text-muted">
        Complete os passos anteriores antes de fazer escolhas.
      </p>
    );
  }

  const skillGroups = cls.skill_choices;
  const allSkillOptions = skillGroups.flatMap((g) => g.options);
  const maxSkills = skillGroups.reduce((s, g) => s + g.choice_count, 0);

  return (
    <div className="space-y-8">
      {maxSkills > 0 ? (
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground">
            Perícias de classe
          </h2>
          <p className="mt-1 text-sm text-muted">
            Escolha {maxSkills} ({state.class_skill_ids.length}/{maxSkills})
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {allSkillOptions.map((skill) => (
              <ChipToggle
                key={skill.skill_id}
                label={skill.name}
                selected={state.class_skill_ids.includes(skill.skill_id)}
                disabled={
                  !state.class_skill_ids.includes(skill.skill_id) &&
                  state.class_skill_ids.length >= maxSkills
                }
                onToggle={() =>
                  onChange(toggleClassSkill(state, data, skill.skill_id))
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      {cls.tool_choices.map((group) => (
        <section key={group.option_group}>
          <h2 className="font-serif text-lg font-semibold text-foreground">
            {group.option_group}
          </h2>
          {group.notes ? (
            <p className="mt-1 text-sm text-muted">{group.notes}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {group.options.map((tool) => {
              const toolId = tool.tool_id;
              if (!toolId) return null;
              const selected = state.class_tool_selections.some(
                (t) => t.tool_id === toolId,
              );
              return (
                <ChipToggle
                  key={`${group.option_group}-${tool.name}`}
                  label={tool.name}
                  selected={selected}
                  onToggle={() =>
                    onChange(
                      setClassTool(state, {
                        tool_id: toolId,
                        name: tool.name,
                        source_type: "class",
                        source_id: cls.id,
                      }),
                    )
                  }
                />
              );
            })}
          </div>
        </section>
      ))}

      {background.tool_proficiency_options
        .filter((opt) => !opt.tool_id && opt.tool_category)
        .map((opt) => {
          const categoryTools =
            data.tools_by_category[opt.tool_category ?? ""] ?? [];
          return (
            <section key={opt.id}>
              <h2 className="font-serif text-lg font-semibold text-foreground">
                Ferramenta do antecedente
              </h2>
              <p className="mt-1 text-sm text-muted">{opt.name}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {categoryTools.map((tool) => {
                  const toolId = tool.tool_id;
                  if (!toolId) return null;
                  const selected = state.background_tool_selections.some(
                    (t) => t.tool_id === toolId,
                  );
                  return (
                    <ChipToggle
                      key={toolId}
                      label={tool.name}
                      selected={selected}
                      onToggle={() =>
                        onChange(
                          setBackgroundTool(state, {
                            tool_id: toolId,
                            name: tool.name,
                            source_type: "background",
                            source_id: background.id,
                          }),
                        )
                      }
                    />
                  );
                })}
              </div>
            </section>
          );
        })}

      {species.traits
        .flatMap((trait) =>
          trait.choice_groups.map((group) => ({ trait, group })),
        )
        .filter(({ group }) => group.is_required)
        .map(({ trait, group }) => (
          <section key={`${trait.trait_id}-${group.option_group}`}>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              {trait.name}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {group.option_group}
              {group.notes ? ` — ${group.notes}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {group.options.map((opt, index) => {
                const selected = state.species_trait_options.some(
                  (entry) =>
                    entry.trait_option_id === opt.trait_option_id,
                );
                return (
                  <ChipToggle
                    key={opt.trait_option_id}
                    label={opt.name}
                    selected={selected}
                    disabled={
                      !selected &&
                      state.species_trait_options.filter(
                        (entry) =>
                          entry.trait_id === group.trait_id &&
                          entry.option_group === group.option_group,
                      ).length >= group.choice_count
                    }
                    onToggle={() =>
                      onChange(
                        toggleSpeciesTraitOption(
                          state,
                          {
                            trait_id: group.trait_id,
                            option_group: group.option_group,
                            selection_key: selectionKey(
                              group.option_group,
                              index,
                            ),
                            trait_option_id: opt.trait_option_id,
                          },
                          group.choice_count,
                        ),
                      )
                    }
                  />
                );
              })}
            </div>
          </section>
        ))}

      {species.name === "Human" ? (
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground">
            Feat de origem (Versátil)
          </h2>
          <p className="mt-1 text-sm text-muted">
            Humanos ganham um feat de origem adicional.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {data.origin_feats.map((feat) => (
              <SelectionCard
                key={feat.id}
                title={feat.name}
                description={feat.description}
                selected={state.human_origin_feat_id === feat.id}
                onSelect={() =>
                  onChange({ ...state, human_origin_feat_id: feat.id })
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      {background.origin_feat_choices.map((group) => (
        <section key={`${group.trait_id}-${group.option_group}`}>
          <h2 className="font-serif text-lg font-semibold text-foreground">
            {background.origin_feat_name}: {group.trait_name}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {group.options.map((opt, index) => {
              const selected = state.origin_feat_trait_options.some(
                (entry) => entry.trait_option_id === opt.trait_option_id,
              );
              return (
                <ChipToggle
                  key={opt.trait_option_id}
                  label={opt.name}
                  selected={selected}
                  disabled={
                    !selected &&
                    state.origin_feat_trait_options.filter(
                      (entry) =>
                        entry.trait_id === group.trait_id &&
                        entry.option_group === group.option_group,
                    ).length >= group.choice_count
                  }
                  onToggle={() =>
                    onChange(
                      toggleOriginFeatTraitOption(
                        state,
                        data,
                        {
                          trait_id: group.trait_id,
                          option_group: group.option_group,
                          selection_key: selectionKey(
                            group.option_group,
                            index,
                          ),
                          trait_option_id: opt.trait_option_id,
                        },
                        group.choice_count,
                      ),
                    )
                  }
                />
              );
            })}
          </div>
        </section>
      ))}

      <section>
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Equipamento inicial
        </h2>
        {background.equipment_options.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Nenhuma opção de equipamento cadastrada para este antecedente.
          </p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {background.equipment_options.map((opt) => {
              const itemList = opt.items
                .map((i) => `${i.quantity}× ${i.item_name}`)
                .join(", ");
              const description =
                itemList ||
                (opt.gp_amount ? `${opt.gp_amount} PO para comprar equipamento` : null) ||
                opt.notes ||
                undefined;

              return (
                <SelectionCard
                  key={opt.option_key}
                  title={
                    opt.label ??
                    (opt.option_key === "A"
                      ? "Opção A — itens"
                      : opt.option_key === "B"
                        ? "Opção B — ouro"
                        : opt.option_key)
                  }
                  description={description}
                  selected={state.equipment_option_key === opt.option_key}
                  onSelect={() =>
                    onChange({ ...state, equipment_option_key: opt.option_key })
                  }
                  meta={
                    opt.gp_amount && itemList
                      ? `${opt.gp_amount} PO em itens`
                      : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function StepDetails({
  data,
  state,
  onChange,
}: {
  data: CharacterBuilderData;
  state: CharacterBuilderState;
  onChange: (patch: Partial<CharacterBuilderState>) => void;
}) {
  const cls = data.classes.find((c) => c.id === state.class_id);
  const species = data.species.find((s) => s.id === state.species_id);
  const background = data.backgrounds.find((b) => b.id === state.background_id);
  const abilities = computePreviewAbilities(data, state);

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="character-name">Nome do personagem</Label>
        <Input
          id="character-name"
          value={state.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Aldric"
          maxLength={255}
          className="mt-1.5"
          autoFocus
        />
      </div>

      <div className="rounded-xl border border-border bg-surface/40 p-5">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Resumo
        </h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
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
              <dd className="mt-1 flex flex-wrap gap-2">
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
    </div>
  );
}

export function CharacterBuilderWizard() {
  const router = useRouter();
  const [summary, setSummary] = useState<CharacterBuilderSummary | null>(null);
  const [details, setDetails] = useState<Partial<CharacterBuilderData> | null>(
    null,
  );
  const [detailsKey, setDetailsKey] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [state, setState] = useState<CharacterBuilderState>(
    createInitialBuilderState,
  );
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const data = useMemo(
    () => (summary ? mergeBuilderCatalog(summary, details) : null),
    [summary, details],
  );

  useEffect(() => {
    fetchCharacterBuilderSummary()
      .then(setSummary)
      .catch(() => {
        /* prefetch opcional — recarrega ao avançar */
      });
  }, []);

  useEffect(() => {
    setDetails(null);
    setDetailsKey(null);
    setState((prev) =>
      prev.equipment_option_key
        ? { ...prev, equipment_option_key: null }
        : prev,
    );
  }, [state.class_id, state.species_id, state.background_id]);

  const patchState = useCallback(
    (patch: Partial<CharacterBuilderState> | CharacterBuilderState) => {
      setState((prev) =>
        typeof patch === "function"
          ? (patch as (s: CharacterBuilderState) => CharacterBuilderState)(prev)
          : { ...prev, ...patch },
      );
      setStepError(null);
    },
    [],
  );

  const currentStepMeta = BUILDER_STEPS[state.step];
  const needsCatalog = state.step >= 1 && state.step <= 2;
  const needsDetails = state.step === 3;

  const ensureSummary = async (): Promise<CharacterBuilderSummary | null> => {
    if (summary) return summary;
    setLoadingCatalog(true);
    try {
      const loaded = await fetchCharacterBuilderSummary();
      setSummary(loaded);
      return loaded;
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar o catálogo.",
      );
      return null;
    } finally {
      setLoadingCatalog(false);
    }
  };

  const ensureDetails = async (): Promise<boolean> => {
    if (!state.class_id || !state.species_id || !state.background_id) {
      return false;
    }

    const key = `${state.class_id}:${state.species_id}:${state.background_id}`;
    if (details?.details_loaded && detailsKey === key) return true;

    setLoadingDetails(true);
    try {
      const loaded = await fetchCharacterBuilderDetails({
        class_id: state.class_id,
        species_id: state.species_id,
        background_id: state.background_id,
      });
      setDetails(loaded);
      setDetailsKey(key);
      return true;
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as escolhas.",
      );
      return false;
    } finally {
      setLoadingDetails(false);
    }
  };

  const goNext = async () => {
    const catalog =
      data ?? (summary ? mergeBuilderCatalog(summary, details) : null);
    const error = validateBuilderStep(catalog, state, state.step);
    if (error) {
      setStepError(error);
      return;
    }

    if (state.step === 0) {
      const loaded = await ensureSummary();
      if (!loaded) return;
    }

    if (state.step === 2) {
      const ok = await ensureDetails();
      if (!ok) return;
    }

    setStepError(null);
    setState((prev) => ({
      ...prev,
      step: Math.min(prev.step + 1, BUILDER_STEPS.length - 1),
    }));
  };

  const goBack = () => {
    setStepError(null);
    setState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 0) }));
  };

  const handleSubmit = async () => {
    const catalog =
      data ?? (summary ? mergeBuilderCatalog(summary, details) : null);
    const error = validateBuilderStep(catalog, state, 4);
    if (error) {
      setStepError(error);
      return;
    }

    setSubmitting(true);
    setStepError(null);

    try {
      const result = await createCharacterFromBuilder(state);
      router.push(`/ficha/${result.character_id}`);
      router.refresh();
    } catch (err) {
      setStepError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar o personagem.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isLastStep = state.step === BUILDER_STEPS.length - 1;
  const stepBusy =
    (needsCatalog && loadingCatalog && !summary) ||
    (needsDetails && loadingDetails && !details?.details_loaded);

  const stepContent = useMemo(() => {
    switch (state.step) {
      case 0:
        return (
          <StepAbilities
            state={state}
            onChange={(next) => {
              setState(next);
              setStepError(null);
            }}
          />
        );
      case 1:
        if (!data) {
          return (
            <p className="text-sm text-muted">
              Carregando espécies e antecedentes…
            </p>
          );
        }
        return (
          <StepOrigin data={data} state={state} onChange={patchState} />
        );
      case 2:
        if (!data) {
          return <p className="text-sm text-muted">Carregando classes…</p>;
        }
        return (
          <StepClass data={data} state={state} onChange={patchState} />
        );
      case 3:
        if (stepBusy || !data?.details_loaded) {
          return (
            <p className="text-sm text-muted">
              Carregando perícias, traços e equipamento…
            </p>
          );
        }
        return (
          <StepChoices
            data={data}
            state={state}
            onChange={(next) => setState(next)}
          />
        );
      case 4:
        if (!data) return null;
        return (
          <StepDetails data={data} state={state} onChange={patchState} />
        );
      default:
        return null;
    }
  }, [data, state, patchState, stepBusy]);

  return (
    <FadeIn className="rounded-2xl border border-border bg-surface/50 p-6">
      <Link
        href="/ficha"
        className="text-sm text-brand transition-colors hover:text-brand-hover"
      >
        ← Voltar às fichas
      </Link>

      <h1 className="mt-4 font-serif text-2xl font-semibold text-foreground">
        Novo personagem
      </h1>
      <p className="mt-1 text-sm text-muted">
        Criação passo a passo — Player&apos;s Handbook 2024
      </p>

      {loadError ? (
        <p
          className="mt-5 rounded-lg border border-danger/30 bg-danger-surface px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      <div className="mt-6">
        <BuilderStepper currentStep={state.step} />
        <p className="hidden text-sm text-muted sm:block">
          {currentStepMeta?.subtitle}
        </p>
      </div>

      {stepError ? (
        <p
          className="mb-4 mt-4 rounded-lg border border-danger/30 bg-danger-surface px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {stepError}
        </p>
      ) : null}

      <div className="min-h-48">{stepContent}</div>

      <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          className="sm:w-auto!"
          disabled={state.step === 0 || submitting || loadingCatalog || loadingDetails}
          onClick={goBack}
        >
          Voltar
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row">
          {isLastStep ? (
            <Button
              type="button"
              loading={submitting}
              className="sm:w-auto!"
              onClick={handleSubmit}
            >
              Criar personagem
            </Button>
          ) : (
            <Button
              type="button"
              className="sm:w-auto!"
              loading={loadingCatalog || loadingDetails}
              disabled={!canAdvance(data, state)}
              onClick={goNext}
            >
              Continuar
            </Button>
          )}
        </div>
      </div>
    </FadeIn>
  );
}
