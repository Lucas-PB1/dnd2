import { forwardRef, type InputHTMLAttributes } from "react";
import { fieldControlClass } from "@/components/ui/fieldStyles";

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
      className={fieldControlClass({ error: Boolean(error), className })}
      {...props}
    />
  ),
);

Input.displayName = "Input";
