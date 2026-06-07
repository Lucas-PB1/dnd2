import { forwardRef, type InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, id, ...props }, ref) => (
    <input
      ref={ref}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error && id ? `${id}-error` : undefined}
      className={`min-h-11 w-full rounded-lg border bg-stone-950/50 px-3 py-2 text-stone-100 placeholder:text-stone-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-50 ${
        error
          ? "border-red-500/70"
          : "border-stone-600/50 hover:border-stone-500/60"
      } ${className}`}
      {...props}
    />
  ),
);

Input.displayName = "Input";
