"use client";

import type { MouseEvent } from "react";

type BuilderInfoButtonProps = {
  label: string;
  onClick: () => void;
};

export function BuilderInfoButton({ label, onClick }: BuilderInfoButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Detalhes: ${label}`}
      className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface-elevated/80 text-xs font-semibold text-muted transition-colors hover:border-brand/50 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      i
    </button>
  );
}
