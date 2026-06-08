"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { LoaderCircle } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "google" | "danger";
type ButtonSize = "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-brand/70 bg-brand text-on-brand shadow-[0_10px_28px_rgb(199_161_90/0.18),inset_0_1px_0_rgb(255_255_255/0.22)] hover:border-brand-hover hover:bg-brand-hover disabled:bg-brand-muted/50 disabled:text-muted-subtle",
  secondary:
    "border border-border-strong bg-surface/65 text-brand-soft shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] hover:border-brand/60 hover:bg-surface-raised",
  ghost:
    "border border-transparent text-brand-soft/85 hover:border-border hover:bg-surface-elevated/70 hover:text-brand-soft",
  google:
    "border border-border bg-surface/80 text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] hover:border-muted hover:bg-surface-elevated",
  danger:
    "border border-danger/35 bg-danger-surface text-danger shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] hover:border-danger/70 hover:bg-danger-surface/80",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "min-h-11 px-4 py-2 text-sm",
  lg: "min-h-12 px-5 py-2.5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "lg",
      loading = false,
      icon,
      iconPosition = "left",
      fullWidth = true,
      className = "",
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex ${
        fullWidth ? "w-full" : "w-auto"
      } items-center justify-center gap-2 rounded-lg font-medium transition-[background-color,border-color,color,box-shadow,transform] hover:-translate-y-px active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
          <span>Aguarde...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === "left" ? (
            <span className="shrink-0" aria-hidden>
              {icon}
            </span>
          ) : null}
          <span className="min-w-0">{children}</span>
          {icon && iconPosition === "right" ? (
            <span className="shrink-0" aria-hidden>
              {icon}
            </span>
          ) : null}
        </>
      )}
    </button>
  ),
);

Button.displayName = "Button";
