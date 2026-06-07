"use client";

import Link from "next/link";
import { FadeIn } from "@/components/motion";
import type { CharacterDetail } from "@/features/character/types/character.types";

type FichaDetailViewProps = {
  character: CharacterDetail;
};

function formatClasses(character: CharacterDetail): string {
  if (!character.classes.length) return "—";
  return character.classes
    .map((entry) => `${entry.name} ${entry.level}`)
    .join(", ");
}

export function FichaDetailView({ character }: FichaDetailViewProps) {
  return (
    <article aria-labelledby="character-detail-heading">
      <FadeIn>
        <Link
          href="/ficha"
          className="text-sm text-brand transition-colors hover:text-brand-hover"
        >
          ← Voltar às fichas
        </Link>
      </FadeIn>

      <FadeIn delay={0.06} className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1
            id="character-detail-heading"
            className="font-serif text-3xl font-bold text-foreground"
          >
            {character.name}
          </h1>
          <span className="rounded-full border border-brand/30 bg-brand-glow/40 px-3 py-1 text-xs font-medium text-brand-soft">
            Nível {character.level}
          </span>
        </div>
      </FadeIn>

      <FadeIn delay={0.12} className="mt-6">
        <dl className="grid gap-4 rounded-2xl border border-border bg-surface/40 p-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-subtle">Espécie</dt>
            <dd className="mt-1 text-foreground">{character.species_name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-subtle">Antecedente</dt>
            <dd className="mt-1 text-foreground">{character.background_name ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-muted-subtle">Classes</dt>
            <dd className="mt-1 text-foreground">{formatClasses(character)}</dd>
          </div>
        </dl>
      </FadeIn>

      <FadeIn delay={0.18} className="mt-6">
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface/20 p-6">
          <h2 className="text-sm font-medium text-muted">Em breve</h2>
          <p className="mt-2 text-sm text-muted-subtle">
            Equipamento, magias, combate e vínculo com campanhas.
          </p>
        </div>
      </FadeIn>
    </article>
  );
}
