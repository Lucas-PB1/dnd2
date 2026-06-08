"use client";

import type { ComponentProps } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Check } from "lucide-react";
import { fieldControlClass } from "@/components/ui/fieldStyles";
import { BuilderInfoButton } from "@/features/character-builder/components/shared/BuilderInfoButton";
import {
  SelectionOptionCard,
  type SelectionFact,
} from "@/features/character-builder/components/shared/SelectionOptionCard";
import { BUILDER_STEPS } from "@/features/character-builder/types/builder.types";

const focusRingClass =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export type { SelectionFact };
export {
  SelectionOptionCard,
  SelectionOptionCardDescription,
  SelectionOptionCardFact,
  SelectionOptionCardFacts,
  SelectionOptionCardHeader,
  SelectionOptionCardMeta,
  SelectionOptionCardShell,
  SelectionOptionCardTitle,
} from "@/features/character-builder/components/shared/SelectionOptionCard";

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
                        ? "bg-accent-muted/35 text-accent-soft"
                        : "bg-surface-elevated text-muted"
                  }`}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <Check className="size-4" aria-hidden /> : index + 1}
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

export function SelectionCard(
  props: ComponentProps<typeof SelectionOptionCard>,
) {
  return <SelectionOptionCard {...props} />;
}

type ChipToggleProps = {
  label: string;
  description?: string | null;
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
  description,
  selected,
  disabled,
  size = "md",
  onToggle,
  onInfo,
}: ChipToggleProps) {
  const sizeClass = chipSizeClasses[size];
  const widthClass = size === "sm" ? "w-full min-w-0" : "";
  const stateClass = selected
    ? "border-brand/45 bg-brand-glow/55 text-brand-soft shadow-[inset_0_1px_0_rgb(255_255_255/0.05)]"
    : "border-border bg-surface/30 text-muted hover:border-border-strong hover:bg-surface/60 hover:text-foreground";
  const paddingClass = onInfo ? "pr-9" : "";
  const baseClass = `${sizeClass} ${widthClass} ${paddingClass} relative min-w-0 text-left transition-[background-color,border-color,color,transform,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40`;

  const handleChipKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <div className={`inline-flex max-w-full ${widthClass}`}>
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
        <span
          className={`block font-medium ${selected ? "text-brand-soft" : "text-foreground"}`}
        >
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block line-clamp-2 text-xs leading-snug text-muted">
            {description}
          </span>
        ) : null}
        {onInfo ? (
          <div className="absolute right-1 top-1">
            <BuilderInfoButton
              label={label}
              size="sm"
              onClick={onInfo}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
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
      className="scrollbar-subtle flex shrink-0 gap-1 overflow-x-auto border-b border-border pb-px"
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
            className={`shrink-0 rounded-t-lg border px-3 py-2 text-sm font-medium transition-[background-color,border-color,color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              active
                ? "border-border border-b-transparent bg-surface/70 text-foreground"
                : "border-transparent text-muted hover:border-border hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.badge ? (
              <span className="ml-1.5 rounded-full border border-brand/20 bg-brand-glow/45 px-1.5 py-0.5 text-[10px] text-brand-soft">
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
      <div
        data-builder-scroll-area="true"
        className="scrollbar-subtle min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"
      >
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
  fieldControlClass({ className: "mt-1.5 disabled:opacity-50" });
