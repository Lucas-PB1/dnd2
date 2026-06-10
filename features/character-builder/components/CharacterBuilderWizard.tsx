"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BuilderShell } from "@/features/character-builder/components/shell/BuilderShell";
import { BuilderImportExport } from "@/features/character-builder/components/shell/BuilderImportExport";
import { BuilderStepContent } from "@/features/character-builder/components/wizard/BuilderStepContent";
import { BuilderWizardFooter } from "@/features/character-builder/components/wizard/BuilderWizardFooter";
import {
  clearDetailSelections,
  nextStepAfter,
  previousStepBefore,
} from "@/features/character-builder/components/wizard/builder-wizard-flow";
import { useBuilderCatalog } from "@/features/character-builder/components/wizard/useBuilderCatalog";
import {
  BUILDER_STEPS,
  type CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";
import {
  canAdvance,
  createInitialBuilderState,
  validateBuilderStep,
} from "@/features/character-builder/hooks/useCharacterBuilder";
import { createCharacterFromBuilder } from "@/features/character-builder/services/builder.service";
import { applyLockedOriginFeatToState } from "@/features/character-builder/domain/origin-feat";

type StatePatch = Partial<CharacterBuilderState> | ((state: CharacterBuilderState) => CharacterBuilderState);

export function CharacterBuilderWizard() {
  const router = useRouter();
  const {
    clearDetails,
    data,
    detailsKey,
    ensureDetails,
    ensureSummary,
    loadError,
    loadingCatalog,
    loadingDetails,
    refetchSummary,
  } = useBuilderCatalog();
  const [state, setState] = useState<CharacterBuilderState>(createInitialBuilderState);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      clearDetails();
      setState(clearDetailSelections);
    });
    return () => {
      active = false;
    };
  }, [
    clearDetails,
    state.background_id,
    state.class_id,
    state.class_level,
    state.secondary_class,
    state.species_id,
    state.subclass_id,
  ]);

  useEffect(() => {
    if (!data?.details_loaded || !state.background_id) return;

    const background = data.backgrounds.find(
      (entry) => entry.id === state.background_id,
    );
    if (!background) return;

    let active = true;
    queueMicrotask(() => {
      if (active) {
        setState((prev) => applyLockedOriginFeatToState(prev, background));
      }
    });
    return () => {
      active = false;
    };
  }, [data, detailsKey, state.background_id]);

  const patchState = useCallback((patch: StatePatch) => {
    setState((prev) =>
      typeof patch === "function" ? patch(prev) : { ...prev, ...patch },
    );
    setStepError(null);
  }, []);

  const replaceState = useCallback((next: CharacterBuilderState) => {
    setState(next);
    setStepError(null);
  }, []);

  const goNext = async () => {
    const error = validateBuilderStep(data, state, state.step);
    if (error) {
      setStepError(error);
      return;
    }

    if ((state.step === 0 || state.step === 2) && !(await ensureSummary(state.class_level))) {
      return;
    }

    if (state.step === 3 && !(await ensureDetails(state))) return;

    setStepError(null);
    setState((prev) => ({
      ...prev,
      step: nextStepAfter(prev.step, data, prev),
    }));
  };

  const goBack = () => {
    setStepError(null);
    setState((prev) => ({
      ...prev,
      step: previousStepBefore(prev.step, data, prev),
    }));
  };

  const goToStep = (step: number) => {
    if (step >= state.step) return;
    setStepError(null);
    setState((prev) => ({ ...prev, step }));
  };

  const handleSubmit = async () => {
    const error = validateBuilderStep(data, state, BUILDER_STEPS.length - 1);
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
        err instanceof Error ? err.message : "Não foi possível criar o personagem.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const needsCatalog = state.step >= 1 && state.step <= 3;
  const needsDetails = state.step === 4 || state.step === 5;
  const stepBusy =
    (needsCatalog && loadingCatalog && !data) ||
    (needsDetails && loadingDetails && !data?.details_loaded);
  const loading = loadingCatalog || loadingDetails;

  return (
    <BuilderShell
      state={state}
      data={data}
      currentStep={state.step}
      onStepClick={goToStep}
      error={stepError}
      loadError={loadError}
      headerActions={<BuilderImportExport state={state} onImport={replaceState} />}
      footer={
        <BuilderWizardFooter
          isFirstStep={state.step === 0}
          isLastStep={state.step === BUILDER_STEPS.length - 1}
          canContinue={canAdvance(data, state)}
          loading={loading}
          submitting={submitting}
          onBack={goBack}
          onNext={goNext}
          onSubmit={handleSubmit}
        />
      }
    >
      <BuilderStepContent
        data={data}
        state={state}
        stepBusy={stepBusy}
        loadingCatalog={loadingCatalog}
        onPatch={patchState}
        onReplace={replaceState}
        onClassLevelChange={(level) => void refetchSummary(level)}
      />
    </BuilderShell>
  );
}
