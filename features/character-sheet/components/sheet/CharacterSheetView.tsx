"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FadeIn } from "@/components/motion";
import { Badge } from "@/components/ui/Badge";
import { Surface } from "@/components/ui/Surface";
import type { CharacterDetail } from "@/features/character-sheet/types/character.types";

type CharacterSheetViewProps = {
  character: CharacterDetail;
};

function formatClasses(character: CharacterDetail): string {
  if (!character.classes.length) return "—";
  return character.classes
    .map((entry) => `${entry.name} ${entry.level}`)
    .join(", ");
}

export function CharacterSheetView({ character }: CharacterSheetViewProps) {
  return (
    <article aria-labelledby="character-detail-heading">
      <FadeIn>
        <Link
          href="/ficha"
          transitionTypes={["nav-back"]}
          className="inline-flex items-center gap-1.5 text-sm text-brand transition-colors hover:text-brand-hover"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar às fichas
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
          <Badge tone="accent">
            Nível {character.level}
          </Badge>
        </div>
      </FadeIn>

      <FadeIn delay={0.12} className="mt-6">
        <Surface className="p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
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
        </Surface>
      </FadeIn>

      <FadeIn delay={0.18} className="mt-6">
        <Surface tone="dashed" className="p-6">
          <h2 className="text-sm font-medium text-muted">Em breve</h2>
          <p className="mt-2 text-sm text-muted-subtle">
            Equipamento, magias, combate e vínculo com campanhas.
          </p>
        </Surface>
      </FadeIn>
    </article>
  );
}
