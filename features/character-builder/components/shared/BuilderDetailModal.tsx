"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

type BuilderDetailModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function BuilderDetailModal({
  open,
  title,
  onClose,
  children,
}: BuilderDetailModalProps) {
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        aria-label="Fechar detalhes"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(85dvh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4">
          <h2
            id={titleId}
            className="font-serif text-lg font-semibold text-foreground"
          >
            {title}
          </h2>
          <Button
            ref={closeRef}
            type="button"
            variant="ghost"
            size="md"
            className="w-auto! shrink-0 px-2!"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </Button>
        </header>
        <div className="overflow-y-auto px-5 py-4 text-sm leading-relaxed text-muted">
          {children}
        </div>
      </div>
    </div>
  );
}
