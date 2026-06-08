"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  loading,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const items = Array.from(focusable).filter(
        (el) => !el.hasAttribute("disabled"),
      );
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-background/82 backdrop-blur-md"
            aria-label="Fechar confirmação"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="editorial-surface relative z-10 w-full max-w-md overflow-hidden rounded-lg p-5"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-danger/35 bg-danger-surface text-danger">
                <TriangleAlert className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h2
                  id={titleId}
                  className="font-serif text-lg font-semibold text-foreground"
                >
                  {title}
                </h2>
                <div className="mt-2 text-sm leading-relaxed text-muted">
                  {description}
                </div>
              </div>
              <Button
                ref={closeRef}
                type="button"
                variant="ghost"
                size="md"
                fullWidth={false}
                className="min-h-9 px-2"
                disabled={loading}
                onClick={onClose}
                aria-label="Fechar"
              >
                <X className="size-4" aria-hidden />
              </Button>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                fullWidth={false}
                disabled={loading}
                onClick={onClose}
              >
                {cancelLabel}
              </Button>
              <Button
                type="button"
                variant="danger"
                fullWidth={false}
                loading={loading}
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
