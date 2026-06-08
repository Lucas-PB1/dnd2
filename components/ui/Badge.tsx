import type { HTMLAttributes } from "react";

type BadgeTone = "brand" | "accent" | "neutral" | "danger" | "success";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  brand: "border-brand/30 bg-brand-glow/55 text-brand-soft",
  accent: "border-accent/30 bg-accent-muted/25 text-accent-soft",
  neutral: "border-border bg-surface/70 text-muted",
  danger: "border-danger/35 bg-danger-surface text-danger",
  success: "border-success/35 bg-success-surface text-success",
};

export function Badge({
  tone = "brand",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex min-h-6 shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
