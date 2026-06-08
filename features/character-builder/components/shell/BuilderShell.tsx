"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { BuilderPreviewPanel } from "@/features/character-builder/components/shell/BuilderPreviewPanel";
import { BuilderStepNav } from "@/features/character-builder/components/shell/BuilderStepNav";
import type {
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";

type BuilderShellProps = {
  state: CharacterBuilderState;
  data: CharacterBuilderData | null;
  currentStep: number;
  onStepClick?: (step: number) => void;
  error?: string | null;
  loadError?: string | null;
  footer: ReactNode;
  children: ReactNode;
};

export function BuilderShell({
  state,
  data,
  currentStep,
  onStepClick,
  error,
  loadError,
  footer,
  children,
}: BuilderShellProps) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border pb-3">
        <div className="min-w-0">
          <Link
            href="/ficha"
            className="text-sm text-brand transition-colors hover:text-brand-hover"
          >
            ← Voltar às fichas
          </Link>
          <h1 className="font-serif text-xl font-semibold text-foreground sm:text-2xl">
            Novo personagem
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">{footer}</div>
      </header>

      {loadError ? (
        <p
          className="mt-3 shrink-0 rounded-lg border border-danger/30 bg-danger-surface px-4 py-2 text-sm text-danger"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      {error ? (
        <p
          className="mt-3 shrink-0 rounded-lg border border-danger/30 bg-danger-surface px-4 py-2 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-4 grid min-h-0 min-w-0 flex-1 gap-5 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_minmax(0,15rem)] lg:gap-6 xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,17rem)] xl:gap-8">
        <aside
          aria-label="Etapas"
          className="hidden min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface/30 lg:flex"
        >
          <div className="overflow-y-auto p-4">
            <BuilderStepNav
              currentStep={currentStep}
              onStepClick={onStepClick}
            />
          </div>
        </aside>

        <section
          aria-label="Área de seleção"
          className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface/40"
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4 sm:p-5">
            {children}
          </div>
        </section>

        <div className="hidden min-h-0 min-w-0 lg:block">
          <BuilderPreviewPanel data={data} state={state} />
        </div>
      </div>

      <nav
        aria-label="Progresso"
        className="mt-5 shrink-0 lg:hidden"
      >
        <BuilderStepNav currentStep={currentStep} onStepClick={onStepClick} />
      </nav>
    </div>
  );
}
