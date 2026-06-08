import type { ReactNode } from "react";
import {
  FormattedGameText,
} from "@/features/character-builder/components/shared/formatGameText";

const factsPanelClass =
  "grid gap-2 rounded-lg border border-border bg-surface/35 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.035)]";

const cardClass =
  "rounded-lg border border-border bg-surface/30 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]";

export function BuilderDetailBody({ children }: { children: ReactNode }) {
  return <div className="space-y-4 text-foreground">{children}</div>;
}

export function BuilderDetailText({
  children,
  fallback = "Sem descrição cadastrada.",
}: {
  children?: string | null;
  fallback?: string;
}) {
  return <FormattedGameText fallback={fallback}>{children}</FormattedGameText>;
}

export function BuilderDetailFacts({
  children,
  columns = 1,
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3;
}) {
  const columnClass =
    columns === 3
      ? "sm:grid-cols-3"
      : columns === 2
        ? "sm:grid-cols-2"
        : "";

  return (
    <dl className={`${factsPanelClass} ${columnClass}`}>
      {children}
    </dl>
  );
}

export function BuilderDetailFact({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div className="min-w-0 rounded-md border border-border/60 bg-surface/25 px-2.5 py-2">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-subtle">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function BuilderDetailHighlight({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-brand/20 bg-brand-glow/20 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.035)]">
      <p className="text-xs font-medium uppercase text-brand-soft">{label}</p>
      <div className="mt-1 text-sm text-foreground">{children}</div>
    </section>
  );
}

export function BuilderDetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="font-medium text-foreground">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function BuilderDetailCard({ children }: { children: ReactNode }) {
  return <article className={cardClass}>{children}</article>;
}

export {
  BuilderDetailDisclosure,
  BuilderDetailDisclosureText,
} from "@/features/character-builder/components/shared/BuilderDetailDisclosure";
