"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { BuilderShell } from "@/features/character-builder/components/shell/BuilderShell";
import { BuilderImportExport } from "@/features/character-builder/components/shell/BuilderImportExport";
import { StepAbilities } from "@/features/character-builder/components/steps/StepAbilities";
import { StepSpecies } from "@/features/character-builder/components/steps/StepSpecies";
import { StepBackground } from "@/features/character-builder/components/steps/StepBackground";
import { StepClass } from "@/features/character-builder/components/steps/StepClass";
import { StepChoices } from "@/features/character-builder/components/steps/StepChoices";
import { StepFeats } from "@/features/character-builder/components/steps/StepFeats";
import { StepDetails } from "@/features/character-builder/components/steps/StepDetails";
import {
  BUILDER_STEPS,
  type CharacterBuilderData,
  type CharacterBuilderState,
  type CharacterBuilderSummary,
} from "@/features/character-builder/types/builder.types";
import {
  canAdvance,
  createInitialBuilderState,
  validateBuilderStep,
} from "@/features/character-builder/hooks/useCharacterBuilder";
import {
  createCharacterFromBuilder,
  fetchCharacterBuilderDetails,
  fetchCharacterBuilderSummary,
  mergeBuilderCatalog,
} from "@/features/character-builder/services/builder.service";
import { applyLockedOriginFeatToState } from "@/features/character-builder/domain/origin-feat";
import { clampClassLevel } from "@/features/character-builder/domain/progression/levels";
import { totalCharacterLevel } from "@/features/character-builder/domain/multiclass/multiclass";
import { requiresFeatStepContent } from "@/features/character-builder/domain/feats/feat-step";

export function CharacterBuilderWizard() {
  const router = useRouter();
  const [summary, setSummary] = useState<CharacterBuilderSummary | null>(null);
  const [summaryLevel, setSummaryLevel] = useState<number | null>(null);
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
    fetchCharacterBuilderSummary(1)
      .then((loaded) => {
        setSummary(loaded);
        setSummaryLevel(1);
      })
      .catch(() => {
        /* prefetch opcional */
      });
  }, []);

  const refetchSummary = useCallback(async (level: number) => {
    const clamped = clampClassLevel(level);
    setLoadingCatalog(true);
    try {
      const loaded = await fetchCharacterBuilderSummary(clamped);
      setSummary(loaded);
      setSummaryLevel(clamped);
      setLoadError(null);
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
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setDetails(null);
      setDetailsKey(null);
      setState((prev) => ({
        ...prev,
        equipment_mode:
          totalCharacterLevel(prev) <= 1 ? "background" : prev.equipment_mode,
        equipment_option_key: null,
        cantrip_spell_ids: [],
        spellbook_spell_ids: [],
        prepared_spell_ids: [],
        feat_spell_selections: [],
        expertise_by_trait: {},
        class_trait_option_selections: [],
        progression_feat_trait_options: [],
      }));
    });
    return () => {
      active = false;
    };
  }, [state.class_id, state.species_id, state.background_id, state.class_level, state.subclass_id, state.secondary_class]);

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
  const needsDetails = state.step === 4 || state.step === 5;

  const nextStepAfter = (
    fromStep: number,
    catalog: CharacterBuilderData | null,
    builderState: CharacterBuilderState,
  ): number => {
    if (
      fromStep === 4 &&
      catalog &&
      !requiresFeatStepContent(catalog, builderState)
    ) {
      return 6;
    }
    return Math.min(fromStep + 1, BUILDER_STEPS.length - 1);
  };

  const previousStepBefore = (
    fromStep: number,
    catalog: CharacterBuilderData | null,
    builderState: CharacterBuilderState,
  ): number => {
    if (
      fromStep === 6 &&
      catalog &&
      !requiresFeatStepContent(catalog, builderState)
    ) {
      return 4;
    }
    return Math.max(fromStep - 1, 0);
  };

  const ensureSummary = async (): Promise<CharacterBuilderSummary | null> => {
    const level = clampClassLevel(state.class_level);
    if (summary && summaryLevel === level) return summary;
    return refetchSummary(level);
  };

  const ensureDetails = async (): Promise<boolean> => {
    if (!state.class_id || !state.species_id || !state.background_id) {
      return false;
    }

    const level = clampClassLevel(state.class_level);
    const key = `${state.class_id}:${state.species_id}:${state.background_id}:${level}:${state.subclass_id ?? 0}`;
    if (details?.details_loaded && detailsKey === key) return true;

    setLoadingDetails(true);
    try {
      const loaded = await fetchCharacterBuilderDetails({
        class_id: state.class_id,
        species_id: state.species_id,
        background_id: state.background_id,
        class_level: level,
        subclass_id: state.subclass_id,
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
      step: nextStepAfter(prev.step, catalog, prev),
    }));
  };

  const goBack = () => {
    const catalog =
      data ?? (summary ? mergeBuilderCatalog(summary, details) : null);
    setStepError(null);
    setState((prev) => ({
      ...prev,
      step: previousStepBefore(prev.step, catalog, prev),
    }));
  };

  const goToStep = (step: number) => {
    if (step >= state.step) return;
    setStepError(null);
    setState((prev) => ({ ...prev, step }));
  };

  const handleSubmit = async () => {
    const catalog =
      data ?? (summary ? mergeBuilderCatalog(summary, details) : null);
    const error = validateBuilderStep(
      catalog,
      state,
      BUILDER_STEPS.length - 1,
    );
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
    const catalogSkeleton = (
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="rounded-lg border border-border bg-surface/35 p-3"
          >
            <Skeleton className="h-5 w-1/2" />
            <SkeletonText lines={2} className="mt-3" />
          </div>
        ))}
      </div>
    );

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
          return catalogSkeleton;
        }
        return (
          <StepSpecies data={data} state={state} onChange={patchState} />
        );
      case 2:
        if (!data) {
          return catalogSkeleton;
        }
        return (
          <StepBackground data={data} state={state} onChange={patchState} />
        );
      case 3:
        if (!data || loadingCatalog) {
          return catalogSkeleton;
        }
        return (
          <StepClass
            data={data}
            state={state}
            onChange={patchState}
            onClassLevelChange={(level) => {
              void refetchSummary(level);
            }}
          />
        );
      case 4:
        if (stepBusy || !data?.details_loaded) {
          return (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full max-w-sm" />
              <SkeletonText lines={4} />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 12 }, (_, index) => (
                  <Skeleton key={index} className="h-9 w-28" />
                ))}
              </div>
            </div>
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
        if (stepBusy || !data?.details_loaded) {
          return (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full max-w-sm" />
              <SkeletonText lines={4} />
            </div>
          );
        }
        return (
          <StepFeats
            data={data}
            state={state}
            onChange={(next) => setState(next)}
          />
        );
      case 6:
        if (!data) return null;
        return (
          <StepDetails data={data} state={state} onChange={patchState} />
        );
      default:
        return null;
    }
  }, [data, state, patchState, stepBusy, loadingCatalog, refetchSummary]);

  const headerActions = (
    <BuilderImportExport
      state={state}
      onImport={(imported) => {
        setState(imported);
        setStepError(null);
      }}
    />
  );

  const footer = (
    <>
      <Button
        type="button"
        variant="ghost"
        size="md"
        icon={<ArrowLeft className="size-4" />}
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
          icon={<Sparkles className="size-4" />}
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
          icon={<ArrowRight className="size-4" />}
          iconPosition="right"
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
      headerActions={headerActions}
      footer={footer}
    >
      {stepContent}
    </BuilderShell>
  );
}
