"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  EASE_OUT,
  DURATION,
  scaleIn,
  staggerContainer,
  staggerItem,
} from "@/components/motion/config";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <motion.div
      className="w-full"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div className="mb-8 text-center" variants={staggerItem}>
        <Link
          href="/"
          className="inline-block text-xs font-semibold uppercase tracking-[0.35em] text-brand/80 transition-colors hover:text-brand"
        >
          D&amp;D 2024
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-bold text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>
        ) : null}
      </motion.div>

      <motion.div
        className="rounded-2xl border border-border bg-surface-overlay p-6 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-8"
        variants={scaleIn}
      >
        {children}
      </motion.div>

      {footer ? (
        <motion.div
          className="mt-6 text-center text-sm text-muted"
          variants={staggerItem}
        >
          {footer}
        </motion.div>
      ) : null}
    </motion.div>
  );
}

export function AuthAlert({
  variant,
  message,
}: {
  variant: "error" | "success" | "info";
  message: string;
}) {
  const styles = {
    error: "border-danger/30 bg-danger-surface text-danger",
    success: "border-success/30 bg-success-surface text-success",
    info: "border-border-strong bg-brand-glow/30 text-brand-soft",
  } as const;

  return (
    <motion.div
      role={variant === "error" ? "alert" : "status"}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: DURATION.fast, ease: EASE_OUT }}
      className={`overflow-hidden rounded-lg border px-4 py-3 text-sm ${styles[variant]}`}
    >
      {message}
    </motion.div>
  );
}

export function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={`${id}-error`} className="mt-1.5 text-sm text-danger" role="alert">
      {message}
    </p>
  );
}
