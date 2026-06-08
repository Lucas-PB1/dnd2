"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { CheckCircle2, Info, TriangleAlert } from "lucide-react";

type AlertVariant = "error" | "success" | "info";

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
  icon?: ReactNode;
};

const variantClasses: Record<AlertVariant, string> = {
  error: "border-danger/35 bg-danger-surface text-danger",
  success: "border-success/35 bg-success-surface text-success",
  info: "border-border-strong bg-brand-glow/35 text-brand-soft",
};

const variantIcon: Record<AlertVariant, ReactNode> = {
  error: <TriangleAlert className="size-4" aria-hidden />,
  success: <CheckCircle2 className="size-4" aria-hidden />,
  info: <Info className="size-4" aria-hidden />,
};

export function Alert({
  variant = "info",
  icon,
  className = "",
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <span className="mt-0.5 shrink-0">{icon ?? variantIcon[variant]}</span>
      <div className="min-w-0 leading-relaxed">{children}</div>
    </div>
  );
}
