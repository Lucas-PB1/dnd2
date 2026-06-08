"use client";

import { Check, Lock } from "lucide-react";
import { BUILDER_STEPS } from "@/features/character-builder/types/builder.types";

type BuilderStepNavProps = {
  currentStep: number;
  onStepClick?: (step: number) => void;
};

export function BuilderStepNav({
  currentStep,
  onStepClick,
}: BuilderStepNavProps) {
  const totalSteps = BUILDER_STEPS.length;
  const progress =
    totalSteps <= 1 ? 100 : Math.round((currentStep / (totalSteps - 1)) * 100);

  return (
    <nav aria-label="Etapas da criação" className="space-y-4">
      <div className="rounded-lg border border-border bg-background/28 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Progresso
          </p>
          <span className="rounded-full border border-border bg-surface/55 px-2 py-0.5 text-xs text-brand-soft">
            {currentStep + 1}/{totalSteps}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Progresso da criação"
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-raised"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-brand transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-subtle">
          Etapa {currentStep + 1} de {totalSteps}
        </p>
      </div>

      <ol className="space-y-1">
        {BUILDER_STEPS.map((step, index) => {
          const done = index < currentStep;
          const active = index === currentStep;
          const clickable = done && onStepClick;
          const locked = index > currentStep;

          return (
            <li key={step.id} className="relative">
              {index < BUILDER_STEPS.length - 1 ? (
                <span
                  className={`absolute left-7 top-11 h-[calc(100%-0.35rem)] w-px ${
                    done ? "bg-accent/45" : "bg-border-muted"
                  }`}
                  aria-hidden
                />
              ) : null}
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick(index)}
                aria-current={active ? "step" : undefined}
                className={`relative z-10 flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-[background-color,border-color,color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default ${
                  active
                    ? "border-brand/35 bg-brand-glow/42 text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.05)]"
                    : done
                      ? "border-transparent text-brand-soft hover:border-border hover:bg-surface/45"
                      : "border-transparent text-muted-subtle"
                }`}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                    active
                      ? "border-brand bg-brand text-on-brand"
                      : done
                        ? "border-accent/30 bg-accent-muted/35 text-accent-soft"
                        : "border-border-muted bg-surface-elevated text-muted"
                  }`}
                >
                  {done ? (
                    <Check className="size-4" aria-hidden />
                  ) : locked ? (
                    <Lock className="size-3.5" aria-hidden />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-medium">
                    {step.title}
                  </span>
                  <span
                    className={`mt-0.5 block truncate text-sm ${
                      active ? "text-muted" : "text-muted-subtle"
                    }`}
                  >
                    {active
                      ? step.subtitle
                      : done
                        ? "Concluído"
                        : "Aguardando"}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
