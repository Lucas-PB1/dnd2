"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { BuilderInfoButton } from "@/features/character-builder/components/shared/BuilderInfoButton";
import { BUILDER_STEPS } from "@/features/character-builder/types/builder.types";

const focusRingClass =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

function CardSelectSurface({
  onClick,
  className = "",
  children,
}: {
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`cursor-pointer ${focusRingClass} ${className}`}
    >
      {children}
    </div>
  );
}

type BuilderStepperProps = {
  currentStep: number;
};

/** @deprecated Prefer BuilderStepNav inside BuilderShell */
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

export type SelectionFact = {
  label: string;
  value: string;
};

type SelectionCardProps = {
  title: string;
  description?: string | null;
  selected?: boolean;
  onSelect: () => void;
  meta?: ReactNode;
  compact?: boolean;
  facts?: SelectionFact[];
  onInfo?: () => void;
};

export function SelectionCard({
  title,
  description,
  selected,
  onSelect,
  meta,
  compact = false,
  facts,
  onInfo,
}: SelectionCardProps) {
  const shellClass = `w-full rounded-xl border text-left transition-colors ${
    compact ? "p-3" : "p-4"
  } ${
    selected
      ? "border-brand bg-brand/10"
      : "border-border bg-surface/40 hover:border-brand/40 hover:bg-surface/70"
  }`;

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p
          className={`font-medium text-foreground ${compact ? "text-base" : ""}`}
        >
          {title}
        </p>
        {selected ? (
          <span className="shrink-0 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-medium text-on-brand">
            ✓
          </span>
        ) : null}
      </div>
      {description ? (
        <p
          className={`mt-0.5 text-muted ${compact ? "line-clamp-1 text-sm" : "line-clamp-2 text-sm"}`}
        >
          {description}
        </p>
      ) : null}
    </>
  );

  if (onInfo) {
    return (
      <div className={shellClass}>
        <div className="flex items-start gap-2">
          <CardSelectSurface onClick={onSelect} className="min-w-0 flex-1 text-left">
            {body}
          </CardSelectSurface>
          <BuilderInfoButton label={title} onClick={onInfo} />
        </div>

        {facts && facts.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {facts.map((fact) => (
              <span
                key={`${fact.label}-${fact.value}`}
                className="rounded-md bg-surface-elevated/80 px-2 py-0.5 text-xs text-muted-subtle"
              >
                <span className="text-muted">{fact.label}:</span> {fact.value}
              </span>
            ))}
          </div>
        ) : null}

        {meta ? (
          <div
            className={`text-muted-subtle ${compact ? "mt-1.5 text-[10px]" : "mt-3 text-xs"}`}
          >
            {meta}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <CardSelectSurface onClick={onSelect} className={shellClass}>
      {body}

      {facts && facts.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {facts.map((fact) => (
            <span
              key={`${fact.label}-${fact.value}`}
              className="rounded-md bg-surface-elevated/80 px-2 py-0.5 text-xs text-muted-subtle"
            >
              <span className="text-muted">{fact.label}:</span> {fact.value}
            </span>
          ))}
        </div>
      ) : null}

      {meta ? (
        <div
          className={`text-muted-subtle ${compact ? "mt-1.5 text-[10px]" : "mt-3 text-xs"}`}
        >
          {meta}
        </div>
      ) : null}
    </CardSelectSurface>
  );
}

type ChipToggleProps = {
  label: string;
  selected: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
  onToggle: () => void;
  onInfo?: () => void;
};

const chipSizeClasses = {
  sm: "rounded-md border px-2 py-1 text-sm",
  md: "rounded-lg border px-3 py-2 text-sm",
} as const;

export function ChipToggle({
  label,
  selected,
  disabled,
  size = "md",
  onToggle,
  onInfo,
}: ChipToggleProps) {
  const sizeClass = chipSizeClasses[size];
  const widthClass = size === "sm" ? "w-full min-w-0" : "";
  const stateClass = selected
    ? "border-brand bg-brand/15 text-brand-soft"
    : "border-border text-muted hover:border-brand/40 hover:text-foreground";
  const baseClass = `${sizeClass} ${widthClass} transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40`;

  const handleChipKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle();
    }
  };

  const chip = (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={selected}
      aria-disabled={disabled || undefined}
      onClick={() => {
        if (!disabled) onToggle();
      }}
      onKeyDown={handleChipKeyDown}
      className={`${baseClass} ${stateClass} ${disabled ? "" : "cursor-pointer"} ${focusRingClass}`}
    >
      {label}
    </div>
  );

  if (onInfo) {
    return (
      <span className="inline-flex items-center gap-0.5">
        {chip}
        <BuilderInfoButton label={label} onClick={onInfo} />
      </span>
    );
  }

  return chip;
}

type BuilderSectionTabsProps = {
  tabs: { id: string; label: string; badge?: string }[];
  activeId: string;
  onChange: (id: string) => void;
};

export function BuilderSectionTabs({
  tabs,
  activeId,
  onChange,
}: BuilderSectionTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Seções de escolha"
      className="flex shrink-0 gap-1 overflow-x-auto border-b border-border pb-px"
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`shrink-0 rounded-t-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              active
                ? "border border-b-0 border-border bg-surface/60 text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.badge ? (
              <span className="ml-1.5 rounded-full bg-brand/15 px-1.5 py-0.5 text-[10px] text-brand">
                {tab.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function BuilderStepFrame({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <header className="shrink-0 pb-3">
        <h2 className="font-serif text-base font-semibold text-foreground">
          {title}
        </h2>
        {hint ? (
          <p className="mt-1 line-clamp-1 text-sm text-muted">{hint}</p>
        ) : null}
      </header>
      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
        {children}
      </div>
    </div>
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
