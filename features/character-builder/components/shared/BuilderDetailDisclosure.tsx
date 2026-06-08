"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { FormattedGameText, formatGameTextPreview } from "@/features/character-builder/components/shared/formatGameText";

const shellClass =
  "rounded-lg border shadow-[inset_0_1px_0_rgb(255_255_255/0.02)] transition-[border-color,background-color,box-shadow] duration-200";

const triggerClass =
  "flex w-full cursor-pointer list-none items-start justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-surface/40";

type BuilderDetailDisclosureProps = {
  title: string;
  meta?: string;
  preview?: string | null;
  children: ReactNode;
};

export function BuilderDetailDisclosure({
  title,
  meta,
  preview,
  children,
}: BuilderDetailDisclosureProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <motion.div
      layout
      className={`${shellClass} ${
        open
          ? "border-brand/30 bg-surface/35 shadow-[inset_0_1px_0_rgb(255_255_255/0.04),0_4px_16px_rgb(0_0_0/0.12)]"
          : "border-border bg-surface/25"
      }`}
      transition={{ layout: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className={triggerClass}
      >
        <span className="min-w-0 flex-1 text-left">
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {meta ? (
              <span className="shrink-0 text-xs font-medium uppercase text-muted-subtle">
                {meta}
              </span>
            ) : null}
            <span className="font-medium text-foreground">{title}</span>
          </span>
          <AnimatePresence initial={false}>
            {preview && !open ? (
              <motion.span
                key="preview"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                className="mt-1 block overflow-hidden text-sm text-muted"
              >
                <span className="line-clamp-2">
                  {formatGameTextPreview(preview)}
                </span>
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className="mt-0.5 inline-flex shrink-0 text-muted"
        >
          <ChevronDown className="size-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -4 }}
              animate={{ y: 0 }}
              exit={{ y: -4 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="border-t border-border/70 px-3 py-2 text-sm"
            >
              {children}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export function BuilderDetailDisclosureText({
  children,
  fallback = "Sem descrição cadastrada.",
}: {
  children?: string | null;
  fallback?: string;
}) {
  return <FormattedGameText fallback={fallback}>{children}</FormattedGameText>;
}
