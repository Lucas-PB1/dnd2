import { forwardRef, type TextareaHTMLAttributes } from "react";
import { fieldControlClass } from "@/components/ui/fieldStyles";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error, id, ...props }, ref) => (
    <textarea
      ref={ref}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error && id ? `${id}-error` : undefined}
      className={fieldControlClass({
        error: Boolean(error),
        className: `min-h-24 resize-y leading-relaxed ${className}`,
      })}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
