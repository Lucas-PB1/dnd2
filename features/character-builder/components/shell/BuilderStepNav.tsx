"use client";

import { BUILDER_STEPS } from "@/features/character-builder/types/builder.types";

type BuilderStepNavProps = {
  currentStep: number;
  onStepClick?: (step: number) => void;
};

export function BuilderStepNav({
  currentStep,
  onStepClick,
}: BuilderStepNavProps) {
  return (
    <nav aria-label="Etapas da criação" className="flex flex-col gap-2">
      {BUILDER_STEPS.map((step, index) => {
        const done = index < currentStep;
        const active = index === currentStep;
        const clickable = done && onStepClick;

        return (
          <button
            key={step.id}
            type="button"
            disabled={!clickable}
            onClick={() => clickable && onStepClick(index)}
            aria-current={active ? "step" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default ${
              active
                ? "bg-brand/15 text-foreground"
                : done
                  ? "text-brand-soft hover:bg-surface-elevated/60"
                  : "text-muted-subtle"
            }`}
          >
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                active
                  ? "bg-brand text-on-brand"
                  : done
                    ? "bg-brand/20 text-brand"
                    : "bg-surface-elevated text-muted"
              }`}
            >
              {done ? "✓" : index + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-base font-medium">{step.title}</span>
              {active ? (
                <span className="mt-0.5 block truncate text-sm text-muted">
                  {step.subtitle}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
