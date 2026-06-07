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
      className={`min-h-11 w-full rounded-lg border bg-background/50 px-3 py-2 text-foreground placeholder:text-muted-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 ${
        error ? "border-danger/70" : "border-border hover:border-border-strong"
      } ${className}`}
      {...props}
    />
  ),
);

Input.displayName = "Input";
