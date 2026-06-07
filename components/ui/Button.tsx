"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "google";
type ButtonSize = "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-amber-600 text-stone-950 hover:bg-amber-500 disabled:bg-amber-900/50 disabled:text-stone-500",
  secondary:
    "border border-amber-700/40 bg-stone-900/60 text-amber-100 hover:border-amber-500/60 hover:bg-stone-900",
  ghost: "text-amber-200/80 hover:bg-stone-800/60 hover:text-amber-100",
  google:
    "border border-stone-600/50 bg-stone-900/80 text-stone-100 hover:border-stone-400/50 hover:bg-stone-800",
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
      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
          <span>Aguarde…</span>
        </>
      ) : (
        children
      )}
    </button>
  ),
);

Button.displayName = "Button";
