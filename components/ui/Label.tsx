import type { LabelHTMLAttributes } from "react";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className = "", children, ...props }: LabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-brand-soft/85 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
