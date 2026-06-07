"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { CharacterSummary } from "@/features/character/types/character.types";

type CharacterCardProps = {
  character: CharacterSummary;
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function formatClasses(character: CharacterSummary): string {
  if (!character.classes.length) return "Sem classe";
  return character.classes
    .map((entry) => `${entry.name} ${entry.level}`)
    .join(", ");
}

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <motion.li whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Link
        href={`/ficha/${character.id}`}
        className="block rounded-xl border border-border bg-surface/40 p-5 transition-colors hover:border-border-strong hover:bg-surface/60"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif text-lg font-semibold text-foreground">
            {character.name}
          </h2>
          <span className="shrink-0 rounded-full border border-border-strong bg-surface/60 px-2.5 py-0.5 text-xs font-medium text-brand-soft">
            Nível {character.level}
          </span>
        </div>

        <p className="mt-2 text-sm text-muted">
          {[character.species_name, character.background_name]
            .filter(Boolean)
            .join(" · ") || "Espécie e antecedente"}
        </p>

        <p className="mt-1 text-sm text-muted-subtle">{formatClasses(character)}</p>

        <p className="mt-4 text-xs text-muted-subtle">
          Atualizado em {formatDate(character.updated_at)}
        </p>
      </Link>
    </motion.li>
  );
}
