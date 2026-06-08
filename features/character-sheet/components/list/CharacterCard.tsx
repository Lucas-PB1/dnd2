"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { deleteCharacter } from "@/features/character-sheet/services/sheet.service";
import type { CharacterSummary } from "@/features/character-sheet/types/character.types";

type CharacterCardProps = {
  character: CharacterSummary;
  onDeleted?: (characterId: number) => void;
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

export function CharacterCard({ character, onDeleted }: CharacterCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Excluir ${character.name}? Esta ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteCharacter(character.id);
      onDeleted?.(character.id);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível excluir a ficha.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface/40 transition-colors hover:border-border-strong hover:bg-surface/55"
    >
      <Link
        href={`/ficha/${character.id}`}
        className="block min-w-0 flex-1 p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-serif text-lg font-semibold text-foreground">
            {character.name}
          </h2>
          <span className="shrink-0 rounded-full border border-border-strong bg-surface/60 px-2.5 py-0.5 text-xs font-medium text-brand-soft">
            Nível {character.level}
          </span>
        </div>

        <p className="mt-3 text-sm text-muted">
          {[character.species_name, character.background_name]
            .filter(Boolean)
            .join(" · ") || "Espécie e antecedente"}
        </p>

        <p className="mt-1 text-sm text-muted-subtle">
          {formatClasses(character)}
        </p>

        <p className="mt-4 text-xs text-muted-subtle">
          Atualizado em {formatDate(character.updated_at)}
        </p>
      </Link>

      <footer className="flex flex-wrap items-center gap-2 border-t border-border/80 bg-surface/25 px-4 py-3">
        <Link
          href={`/ficha/${character.id}`}
          className="inline-flex min-h-11 w-auto items-center justify-center rounded-lg border border-border-strong bg-surface/60 px-4 py-2 text-sm font-medium text-brand-soft transition-colors hover:border-brand/60 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Ver ficha
        </Link>
        <Link
          href={`/ficha/${character.id}`}
          className="inline-flex min-h-11 w-auto items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-brand-soft/80 transition-colors hover:bg-surface-elevated/60 hover:text-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Editar
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="md"
          className="w-auto! text-danger hover:bg-danger-surface hover:text-danger"
          loading={deleting}
          onClick={handleDelete}
        >
          Excluir
        </Button>
      </footer>

      {error ? (
        <p className="px-4 pb-3 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </motion.article>
  );
}
