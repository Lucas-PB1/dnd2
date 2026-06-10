"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { CalendarDays, Eye, Pencil, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteCharacter } from "@/features/character-sheet/services/sheet.service";
import type { CharacterSummary } from "@/shared/character";

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      await deleteCharacter(character.id);
      setConfirmOpen(false);
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
      className="editorial-card editorial-card-interactive flex h-full min-w-0 flex-col overflow-hidden rounded-lg"
    >
      <Link
        href={`/ficha/${character.id}`}
        transitionTypes={["nav-forward"]}
        className="block min-w-0 flex-1 p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-serif text-lg font-semibold text-foreground">
            {character.name}
          </h2>
          <Badge tone="accent">
            Nível {character.level}
          </Badge>
        </div>

        <p className="mt-3 text-sm text-muted">
          {[character.species_name, character.background_name]
            .filter(Boolean)
            .join(" · ") || "Espécie e antecedente"}
        </p>

        <p className="mt-1 text-sm text-muted-subtle">
          {formatClasses(character)}
        </p>

        <p className="mt-4 inline-flex items-center gap-1 text-xs text-muted-subtle">
          <CalendarDays className="size-3.5" aria-hidden />
          Atualizado em {formatDate(character.updated_at)}
        </p>
      </Link>

      <footer className="flex flex-wrap items-center gap-2 border-t border-border/80 bg-background/25 px-4 py-3">
        <Link
          href={`/ficha/${character.id}`}
          transitionTypes={["nav-forward"]}
          className="inline-flex min-h-11 w-auto items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface/60 px-4 py-2 text-sm font-medium text-brand-soft transition-[background-color,border-color,color,transform] hover:-translate-y-0.5 hover:border-brand/60 hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <Eye className="size-4" aria-hidden />
          Ver ficha
        </Link>
        <Link
          href={`/ficha/${character.id}`}
          transitionTypes={["nav-forward"]}
          className="inline-flex min-h-11 w-auto items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-brand-soft/80 transition-[background-color,border-color,color,transform] hover:-translate-y-0.5 hover:border-border hover:bg-surface-elevated/70 hover:text-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <Pencil className="size-4" aria-hidden />
          Editar
        </Link>
        <Button
          type="button"
          variant="danger"
          size="md"
          fullWidth={false}
          icon={<Trash2 className="size-4" />}
          className="w-auto!"
          loading={deleting}
          onClick={() => setConfirmOpen(true)}
        >
          Excluir
        </Button>
      </footer>

      {error ? (
        <div className="px-4 pb-3">
          <Alert variant="error" className="px-3 py-2 text-xs">{error}</Alert>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title={`Excluir ${character.name}?`}
        description="Esta ação não pode ser desfeita e a ficha será removida da sua lista."
        confirmLabel="Excluir ficha"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleting) setConfirmOpen(false);
        }}
      />
    </motion.article>
  );
}
