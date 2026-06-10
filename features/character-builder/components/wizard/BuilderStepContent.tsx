import { useMemo } from "react";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { StepAbilities } from "@/features/character-builder/components/steps/StepAbilities";
import { StepBackground } from "@/features/character-builder/components/steps/StepBackground";
import { StepChoices } from "@/features/character-builder/components/steps/StepChoices";
import { StepClass } from "@/features/character-builder/components/steps/StepClass";
import { StepDetails } from "@/features/character-builder/components/steps/StepDetails";
import { StepFeats } from "@/features/character-builder/components/steps/StepFeats";
import { StepSpecies } from "@/features/character-builder/components/steps/StepSpecies";
import type {
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";

type StatePatch =
  | Partial<CharacterBuilderState>
  | ((state: CharacterBuilderState) => CharacterBuilderState);

type BuilderStepContentProps = {
  data: CharacterBuilderData | null;
  state: CharacterBuilderState;
  stepBusy: boolean;
  loadingCatalog: boolean;
  onPatch: (patch: StatePatch) => void;
  onReplace: (state: CharacterBuilderState) => void;
  onClassLevelChange: (level: number) => void;
};

function CatalogSkeleton() {
  return (
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
}

function ChoiceSkeleton({ dense = true }: { dense?: boolean }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-sm" />
      <SkeletonText lines={4} />
      {dense ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 12 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-28" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function BuilderStepContent({
  data,
  state,
  stepBusy,
  loadingCatalog,
  onPatch,
  onReplace,
  onClassLevelChange,
}: BuilderStepContentProps) {
  return useMemo(() => {
    switch (state.step) {
      case 0:
        return <StepAbilities state={state} onChange={onReplace} />;
      case 1:
        return data ? (
          <StepSpecies data={data} state={state} onChange={onPatch} />
        ) : (
          <CatalogSkeleton />
        );
      case 2:
        return data ? (
          <StepBackground data={data} state={state} onChange={onPatch} />
        ) : (
          <CatalogSkeleton />
        );
      case 3:
        if (!data || loadingCatalog) return <CatalogSkeleton />;
        return (
          <StepClass
            data={data}
            state={state}
            onChange={onPatch}
            onClassLevelChange={onClassLevelChange}
          />
        );
      case 4:
        if (stepBusy || !data?.details_loaded) return <ChoiceSkeleton />;
        return <StepChoices data={data} state={state} onChange={onReplace} />;
      case 5:
        if (stepBusy || !data?.details_loaded) return <ChoiceSkeleton dense={false} />;
        return <StepFeats data={data} state={state} onChange={onReplace} />;
      case 6:
        return data ? (
          <StepDetails data={data} state={state} onChange={onPatch} />
        ) : null;
      default:
        return null;
    }
  }, [
    data,
    loadingCatalog,
    onClassLevelChange,
    onPatch,
    onReplace,
    state,
    stepBusy,
  ]);
}
