import { forwardRef, type SelectHTMLAttributes } from "react";
import { fieldControlClass } from "@/components/ui/fieldStyles";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", error, id, children, ...props }, ref) => (
    <select
      ref={ref}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error && id ? `${id}-error` : undefined}
      className={fieldControlClass({
        error: Boolean(error),
        className: `appearance-auto ${className}`,
      })}
      {...props}
    >
      {children}
    </select>
  ),
);

Select.displayName = "Select";
