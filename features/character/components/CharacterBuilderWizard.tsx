"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { BuilderShell } from "@/features/character/components/builder/BuilderShell";
import { StepAbilities } from "@/features/character/components/builder/StepAbilities";
import { StepSpecies } from "@/features/character/components/builder/StepSpecies";
import { StepBackground } from "@/features/character/components/builder/StepBackground";
import { StepClass } from "@/features/character/components/builder/StepClass";
import { StepChoices } from "@/features/character/components/builder/StepChoices";
import { StepDetails } from "@/features/character/components/builder/StepDetails";
import {
  BUILDER_STEPS,
  type CharacterBuilderData,
  type CharacterBuilderState,
  type CharacterBuilderSummary,
} from "@/features/character/types/builder.types";
import {
  canAdvance,
  createInitialBuilderState,
  validateBuilderStep,
} from "@/features/character/hooks/useCharacterBuilder";
import {
  createCharacterFromBuilder,
  fetchCharacterBuilderDetails,
  fetchCharacterBuilderSummary,
  mergeBuilderCatalog,
} from "@/features/character/services/character.service";
import { applyLockedOriginFeatToState } from "@/lib/character/origin-feat";

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
        /* prefetch opcional */
      });
  }, []);

  useEffect(() => {
    setDetails(null);
    setDetailsKey(null);
    setState((prev) => ({
      ...prev,
      equipment_option_key: null,
      cantrip_spell_ids: [],
      spellbook_spell_ids: [],
      prepared_spell_ids: [],
      expertise_by_trait: {},
    }));
  }, [state.class_id, state.species_id, state.background_id]);

  useEffect(() => {
    if (!data?.details_loaded || !state.background_id) return;

    const background = data.backgrounds.find(
      (entry) => entry.id === state.background_id,
    );
    if (!background) return;

    setState((prev) => applyLockedOriginFeatToState(prev, background));
  }, [data, detailsKey, state.background_id]);

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

  const needsCatalog = state.step >= 1 && state.step <= 3;
  const needsDetails = state.step === 4;

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

    if (state.step === 3) {
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

  const goToStep = (step: number) => {
    if (step >= state.step) return;
    setStepError(null);
    setState((prev) => ({ ...prev, step }));
  };

  const handleSubmit = async () => {
    const catalog =
      data ?? (summary ? mergeBuilderCatalog(summary, details) : null);
    const error = validateBuilderStep(catalog, state, 5);
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
            <p className="text-sm text-muted">Carregando espécies…</p>
          );
        }
        return (
          <StepSpecies data={data} state={state} onChange={patchState} />
        );
      case 2:
        if (!data) {
          return (
            <p className="text-sm text-muted">Carregando antecedentes…</p>
          );
        }
        return (
          <StepBackground data={data} state={state} onChange={patchState} />
        );
      case 3:
        if (!data) {
          return <p className="text-sm text-muted">Carregando classes…</p>;
        }
        return (
          <StepClass data={data} state={state} onChange={patchState} />
        );
      case 4:
        if (stepBusy || !data?.details_loaded) {
          return (
            <p className="text-sm text-muted">
              Carregando perícias, magias, traços e equipamento…
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
      case 5:
        if (!data) return null;
        return (
          <StepDetails data={data} state={state} onChange={patchState} />
        );
      default:
        return null;
    }
  }, [data, state, patchState, stepBusy]);

  const footer = (
    <>
      <Button
        type="button"
        variant="ghost"
        size="md"
        className="w-auto!"
        disabled={state.step === 0 || submitting || loadingCatalog || loadingDetails}
        onClick={goBack}
      >
        Voltar
      </Button>
      {isLastStep ? (
        <Button
          type="button"
          size="md"
          loading={submitting}
          className="w-auto!"
          onClick={handleSubmit}
        >
          Criar personagem
        </Button>
      ) : (
        <Button
          type="button"
          size="md"
          className="w-auto!"
          loading={loadingCatalog || loadingDetails}
          disabled={!canAdvance(data, state)}
          onClick={goNext}
        >
          Continuar
        </Button>
      )}
    </>
  );

  return (
    <BuilderShell
      state={state}
      data={data}
      currentStep={state.step}
      onStepClick={goToStep}
      error={stepError}
      loadError={loadError}
      footer={footer}
    >
      {stepContent}
    </BuilderShell>
  );
}
