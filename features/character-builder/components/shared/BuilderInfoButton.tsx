"use client";

import type { MouseEvent } from "react";
import { Info } from "lucide-react";

type BuilderInfoButtonProps = {
  label: string;
  onClick: () => void;
  size?: "sm" | "md";
};

const sizeClasses = {
  sm: "size-6",
  md: "size-7",
} as const;

const iconClasses = {
  sm: "size-3",
  md: "size-3.5",
} as const;

export function BuilderInfoButton({
  label,
  onClick,
  size = "md",
}: BuilderInfoButtonProps) {
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
      className={`flex shrink-0 items-center justify-center rounded-full border border-border bg-surface-elevated/80 text-muted transition-[background-color,border-color,color] hover:border-accent/50 hover:bg-accent-muted/20 hover:text-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${sizeClasses[size]}`}
    >
      <Info className={iconClasses[size]} aria-hidden />
    </button>
  );
}
