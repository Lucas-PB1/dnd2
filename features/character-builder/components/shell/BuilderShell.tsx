"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
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
  headerActions?: ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

function canScrollInDirection(element: HTMLElement, deltaY: number) {
  if (deltaY < 0) return element.scrollTop > 0;
  if (deltaY > 0) {
    return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
  }
  return false;
}

function closestScrollable(
  target: EventTarget | null,
  boundary: HTMLElement | null,
) {
  let node = target instanceof HTMLElement ? target : null;

  while (node && node !== boundary) {
    const overflowY = window.getComputedStyle(node).overflowY;
    const scrollable =
      (overflowY === "auto" ||
        overflowY === "scroll" ||
        overflowY === "overlay") &&
      node.scrollHeight > node.clientHeight;

    if (scrollable) return node;
    node = node.parentElement;
  }

  return null;
}

export function BuilderShell({
  state,
  data,
  currentStep,
  onStepClick,
  error,
  loadError,
  headerActions,
  footer,
  children,
}: BuilderShellProps) {
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      const target = event.target;
      const choiceScrollArea = shell.querySelector<HTMLElement>(
        "[data-builder-scroll-area='true']",
      );

      if (!choiceScrollArea) return;

      if (
        target instanceof Node &&
        choiceScrollArea.contains(target) &&
        canScrollInDirection(choiceScrollArea, event.deltaY)
      ) {
        choiceScrollArea.scrollTop += event.deltaY;
        event.preventDefault();
        return;
      }

      const targetScrollable = closestScrollable(target, shell);

      if (
        targetScrollable &&
        canScrollInDirection(targetScrollable, event.deltaY)
      ) {
        return;
      }

      if (!canScrollInDirection(choiceScrollArea, event.deltaY)) return;

      choiceScrollArea.scrollTop += event.deltaY;
      event.preventDefault();
    };

    shell.addEventListener("wheel", handleWheel, {
      capture: true,
      passive: false,
    });

    return () => {
      shell.removeEventListener("wheel", handleWheel, { capture: true });
    };
  }, []);

  return (
    <div
      ref={shellRef}
      className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden"
    >
      <header className="shrink-0 border-b border-border pb-3">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <Link
              href="/ficha"
              transitionTypes={["nav-back"]}
              className="inline-flex items-center gap-1.5 text-sm text-brand transition-colors hover:text-brand-hover"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Voltar às fichas
            </Link>
            <h1 className="font-serif text-xl font-semibold text-foreground sm:text-2xl">
              Novo personagem
            </h1>
          </div>
          {headerActions ? (
            <div className="flex shrink-0 items-center">{headerActions}</div>
          ) : null}
        </div>
      </header>

      {loadError ? (
        <Alert variant="error" className="mt-3 shrink-0 py-2">
          {loadError}
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="error" className="mt-3 shrink-0 py-2">
          {error}
        </Alert>
      ) : null}

      <div className="mt-4 grid min-h-0 min-w-0 flex-1 gap-5 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_minmax(0,15rem)] lg:gap-6 xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,17rem)] xl:gap-8">
        <aside
          aria-label="Etapas"
          className="editorial-card hidden min-h-0 min-w-0 flex-col overflow-hidden rounded-lg lg:flex"
        >
          <div className="scrollbar-subtle overflow-y-auto p-4" data-builder-passive-panel>
            <BuilderStepNav
              currentStep={currentStep}
              onStepClick={onStepClick}
            />
          </div>
        </aside>

        <section
          aria-label="Área de seleção"
          className="editorial-card flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg"
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

      <footer className="mt-4 flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
        {footer}
      </footer>
    </div>
  );
}
