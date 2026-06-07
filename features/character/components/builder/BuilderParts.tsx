"use client";

import type { ReactNode } from "react";
import { BUILDER_STEPS } from "@/features/character/types/builder.types";

type BuilderStepperProps = {
  currentStep: number;
};

export function BuilderStepper({ currentStep }: BuilderStepperProps) {
  return (
    <nav aria-label="Progresso da criação" className="mb-8">
      <ol className="flex flex-wrap gap-2 sm:gap-0">
        {BUILDER_STEPS.map((step, index) => {
          const done = index < currentStep;
          const active = index === currentStep;

          return (
            <li
              key={step.id}
              className="flex min-w-0 flex-1 items-center last:flex-none"
            >
              <div className="flex min-w-0 flex-col items-start sm:items-center">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    active
                      ? "bg-brand text-on-brand"
                      : done
                        ? "bg-brand/20 text-brand"
                        : "bg-surface-elevated text-muted"
                  }`}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? "✓" : index + 1}
                </span>
                <span
                  className={`mt-1.5 hidden text-xs font-medium sm:block ${
                    active ? "text-foreground" : "text-muted"
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < BUILDER_STEPS.length - 1 ? (
                <div
                  className={`mx-2 hidden h-px flex-1 sm:block ${
                    done ? "bg-brand/40" : "bg-border"
                  }`}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm text-muted sm:hidden">
        {BUILDER_STEPS[currentStep]?.subtitle}
      </p>
    </nav>
  );
}

type SelectionCardProps = {
  title: string;
  description?: string | null;
  selected?: boolean;
  onSelect: () => void;
  meta?: ReactNode;
};

export function SelectionCard({
  title,
  description,
  selected,
  onSelect,
  meta,
}: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        selected
          ? "border-brand bg-brand/10"
          : "border-border bg-surface/40 hover:border-brand/40 hover:bg-surface/70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-foreground">{title}</p>
          {description ? (
            <p className="mt-1 line-clamp-3 text-sm text-muted">{description}</p>
          ) : null}
        </div>
        {selected ? (
          <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-xs font-medium text-on-brand">
            Selecionado
          </span>
        ) : null}
      </div>
      {meta ? <div className="mt-3 text-xs text-muted-subtle">{meta}</div> : null}
    </button>
  );
}

type ChipToggleProps = {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

export function ChipToggle({
  label,
  selected,
  disabled,
  onToggle,
}: ChipToggleProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? "border-brand bg-brand/15 text-brand-soft"
          : "border-border text-muted hover:border-brand/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

export const ABILITY_LABELS: Record<string, string> = {
  STR: "Força",
  DEX: "Destreza",
  CON: "Constituição",
  INT: "Inteligência",
  WIS: "Sabedoria",
  CHA: "Carisma",
};

export const selectClassName =
  "mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50";
