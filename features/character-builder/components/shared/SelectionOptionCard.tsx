"use client";

import type { ReactNode } from "react";
import { BuilderInfoButton } from "@/features/character-builder/components/shared/BuilderInfoButton";

const focusRingClass =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export type SelectionFact = {
  label: string;
  value: string;
};

export type SelectedMarkPosition = "header" | "leading";

type SelectionOptionCardShellProps = {
  selected?: boolean;
  compact?: boolean;
  fillHeight?: boolean;
  disabled?: boolean;
  selectedMarkPosition?: SelectedMarkPosition;
  onSelect: () => void;
  onInfo?: () => void;
  infoLabel?: string;
  children: ReactNode;
};

function defaultShellClass(
  selected: boolean | undefined,
  compact: boolean,
  fillHeight: boolean,
  disabled?: boolean,
): string {
  return `w-full rounded-lg border text-left shadow-[inset_0_1px_0_rgb(255_255_255/0.035)] transition-[background-color,border-color,box-shadow] ${
    compact ? "p-3" : "p-4"
  } ${fillHeight ? "flex h-full min-h-[8.75rem] flex-col" : ""} ${
    disabled ? "cursor-not-allowed opacity-40" : ""
  } ${
    selected
      ? "border-brand/50 bg-brand-glow/45"
      : "border-border bg-surface/40 hover:border-brand/35 hover:bg-surface/62 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.045)]"
  }`;
}

function leadingShellClass(selected: boolean | undefined): string {
  return `group relative min-h-16 w-full overflow-hidden rounded-lg border px-3 py-2 text-left shadow-[inset_0_1px_0_rgb(255_255_255/0.035)] transition-[background-color,border-color,box-shadow] ${
    selected
      ? "border-brand/55 bg-brand-glow/42 shadow-[inset_0_1px_0_rgb(255_255_255/0.05),0_8px_22px_rgb(0_0_0/0.16)]"
      : "border-border bg-surface/35 hover:border-brand/30 hover:bg-surface/56 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.045)]"
  }`;
}

function SelectionOptionCardLeadingAccent({
  selected,
}: {
  selected?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`absolute inset-y-2 left-0 w-0.5 rounded-r-full transition-colors ${
        selected ? "bg-brand" : "bg-transparent group-hover:bg-brand/30"
      }`}
    />
  );
}

export function SelectionOptionCardShell({
  selected,
  compact = false,
  fillHeight = false,
  disabled = false,
  selectedMarkPosition = "header",
  onSelect,
  onInfo,
  infoLabel,
  children,
}: SelectionOptionCardShellProps) {
  if (selectedMarkPosition === "leading") {
    const paddingClass = onInfo ? "pr-10" : "";
    const leadingDisabledClass = disabled ? "cursor-not-allowed opacity-40" : "";

    if (onInfo) {
      return (
        <div className="relative min-w-0">
          <button
            type="button"
            aria-pressed={selected}
            onClick={() => {
              if (!disabled) onSelect();
            }}
            disabled={disabled}
            className={`block cursor-pointer ${focusRingClass} ${leadingShellClass(selected)} ${paddingClass} ${leadingDisabledClass}`}
          >
            <SelectionOptionCardLeadingAccent selected={selected} />
            {children}
          </button>
          <div className="absolute right-2 top-2">
            <BuilderInfoButton label={infoLabel ?? ""} onClick={onInfo} />
          </div>
        </div>
      );
    }

    return (
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => {
          if (!disabled) onSelect();
        }}
        disabled={disabled}
        className={`block cursor-pointer ${focusRingClass} ${leadingShellClass(selected)} ${leadingDisabledClass}`}
      >
        <SelectionOptionCardLeadingAccent selected={selected} />
        {children}
      </button>
    );
  }

  const paddingClass = onInfo ? "pr-12" : "";

  if (onInfo) {
    return (
      <div className={`relative ${fillHeight ? "h-full" : ""}`}>
        <button
          type="button"
          aria-pressed={selected}
          onClick={() => {
            if (!disabled) onSelect();
          }}
          disabled={disabled}
          className={`block cursor-pointer ${focusRingClass} ${defaultShellClass(selected, compact, fillHeight, disabled)} ${paddingClass}`}
        >
          {children}
        </button>
        <div className="absolute right-3 top-3">
          <BuilderInfoButton label={infoLabel ?? ""} onClick={onInfo} />
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => {
        if (!disabled) onSelect();
      }}
      disabled={disabled}
      className={`block cursor-pointer ${focusRingClass} ${defaultShellClass(selected, compact, fillHeight, disabled)}`}
    >
      {children}
    </button>
  );
}

export function SelectionOptionCardHeader({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-2">{children}</div>
  );
}

export function SelectionOptionCardTitle({
  children,
  compact = false,
  truncate = false,
}: {
  children: ReactNode;
  compact?: boolean;
  truncate?: boolean;
}) {
  return (
    <p
      className={`min-w-0 font-medium text-foreground ${compact ? "text-base" : ""} ${truncate ? "truncate text-sm font-semibold" : ""}`}
    >
      {children}
    </p>
  );
}

export function SelectionOptionCardDescription({
  children,
  compact = false,
  lines = compact ? 1 : 2,
}: {
  children: ReactNode;
  compact?: boolean;
  lines?: 1 | 2 | 3 | 4;
}) {
  const clampClass =
    lines === 1
      ? "line-clamp-1"
      : lines === 2
        ? "line-clamp-2"
        : lines === 3
          ? "line-clamp-3"
          : "line-clamp-4";

  return (
    <p
      className={`mt-0.5 text-muted ${compact ? "text-sm" : "text-sm"} ${clampClass}`}
    >
      {children}
    </p>
  );
}

export function SelectionOptionCardFacts({
  facts,
  className = "mt-2",
  columns = 1,
  fillHeight = false,
}: {
  facts: SelectionFact[];
  className?: string;
  columns?: 1 | 2 | 3;
  fillHeight?: boolean;
}) {
  if (facts.length === 0) return null;

  const layoutClass =
    columns === 3
      ? "grid grid-cols-3 gap-1"
      : columns === 2
        ? "grid grid-cols-2 gap-1"
        : "flex flex-wrap gap-1";

  return (
    <div
      className={`${layoutClass} ${fillHeight ? "mt-auto min-h-13 content-start" : className}`}
    >
      {facts.map((fact, index) => (
        <SelectionOptionCardFact
          key={`${fact.label}-${fact.value}-${index}`}
          compact={columns !== 1}
          {...fact}
        />
      ))}
    </div>
  );
}

export function SelectionOptionCardFact({
  label,
  value,
  compact = false,
}: SelectionFact & { compact?: boolean }) {
  return (
    <span
      className={`block min-w-0 rounded-md border border-border-muted bg-surface-elevated/80 px-2 py-0.5 text-xs text-muted-subtle ${
        compact ? "truncate text-center" : ""
      }`}
    >
      {label ? (
        <>
          <span className="text-muted">{label}:</span> {value}
        </>
      ) : (
        <span className="text-foreground">{value}</span>
      )}
    </span>
  );
}

export function SelectionOptionCardMeta({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`text-muted-subtle ${compact ? "mt-1.5 text-[10px]" : "mt-3 text-xs"}`}
    >
      {children}
    </div>
  );
}

type SelectionOptionCardProps = {
  title: string;
  description?: string | null;
  selected?: boolean;
  disabled?: boolean;
  onSelect: () => void;
  meta?: ReactNode;
  compact?: boolean;
  fillHeight?: boolean;
  facts?: SelectionFact[];
  factsColumns?: 1 | 2 | 3;
  onInfo?: () => void;
  selectedMarkPosition?: SelectedMarkPosition;
  descriptionLines?: 1 | 2 | 3 | 4;
};

export function SelectionOptionCard({
  title,
  description,
  selected,
  disabled = false,
  onSelect,
  meta,
  compact = false,
  fillHeight = false,
  facts,
  factsColumns = 1,
  onInfo,
  selectedMarkPosition = "header",
  descriptionLines,
}: SelectionOptionCardProps) {
  return (
    <SelectionOptionCardShell
      selected={selected}
      compact={compact}
      fillHeight={fillHeight}
      disabled={disabled}
      selectedMarkPosition={selectedMarkPosition}
      onSelect={onSelect}
      onInfo={onInfo}
      infoLabel={title}
    >
      <div className={`min-w-0 text-left ${fillHeight ? "flex-1" : ""}`}>
        <SelectionOptionCardHeader>
          <SelectionOptionCardTitle
            compact={compact}
            truncate={selectedMarkPosition === "leading"}
          >
            {title}
          </SelectionOptionCardTitle>
        </SelectionOptionCardHeader>

        {description ? (
          <SelectionOptionCardDescription
            compact={compact}
            lines={descriptionLines ?? (compact ? 1 : 2)}
          >
            {description}
          </SelectionOptionCardDescription>
        ) : null}
      </div>

      {facts && facts.length > 0 ? (
        <SelectionOptionCardFacts
          facts={facts}
          columns={factsColumns}
          fillHeight={fillHeight}
          className={selectedMarkPosition === "leading" ? "mt-1" : "mt-2"}
        />
      ) : null}

      {meta ? (
        <SelectionOptionCardMeta compact={compact}>{meta}</SelectionOptionCardMeta>
      ) : null}
    </SelectionOptionCardShell>
  );
}
