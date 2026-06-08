"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Surface } from "@/components/ui/Surface";
import type { CharacterDetail } from "@/features/character-sheet/types/character.types";

type CharacterLevelUpSectionProps = {
  character: CharacterDetail;
};

export function CharacterLevelUpSection({ character }: CharacterLevelUpSectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState(character.classes[0]?.name ?? "");
  const [newLevel, setNewLevel] = useState(
    String((character.classes[0]?.level ?? 0) + 1),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedClass = character.classes.find((entry) => entry.name === className);

  async function handleLevelUp() {
    if (!selectedClass) return;

    setSubmitting(true);
    setError(null);

    try {
      const catalogResponse = await fetch("/api/characters/catalog", {
        credentials: "include",
      });
      const catalog = catalogResponse.ok
        ? ((await catalogResponse.json()) as {
            classes?: { id: number; name: string }[];
          })
        : { classes: [] };

      const classId = catalog.classes?.find((entry) => entry.name === selectedClass.name)?.id;

      if (!classId) {
        throw new Error("Classe não encontrada no catálogo.");
      }

      const response = await fetch(`/api/characters/${character.id}/level-up`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: classId,
          new_class_level: Number(newLevel),
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível subir de nível.");
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao subir de nível.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!character.is_owner || character.level >= 20) return null;

  return (
    <Surface className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-foreground">Subir de nível</h2>
          <p className="mt-1 text-xs text-muted">
            Sobe o nível de uma classe existente e sincroniza slots e recursos.
          </p>
        </div>
        <Button
          type="button"
          variant={open ? "secondary" : "primary"}
          size="md"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Cancelar" : "Level-up"}
        </Button>
      </div>

      {open ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="level-up-class">Classe</Label>
            <Select
              id="level-up-class"
              className="mt-1.5 w-full"
              value={className}
              onChange={(event) => {
                setClassName(event.target.value);
                const cls = character.classes.find(
                  (entry) => entry.name === event.target.value,
                );
                setNewLevel(String((cls?.level ?? 0) + 1));
              }}
            >
              {character.classes.map((entry) => (
                <option key={entry.name} value={entry.name}>
                  {entry.name} {entry.level}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="level-up-level">Novo nível da classe</Label>
            <Select
              id="level-up-level"
              className="mt-1.5 w-full"
              value={newLevel}
              onChange={(event) => setNewLevel(event.target.value)}
            >
              {Array.from({ length: 20 }, (_, index) => index + 1).map((level) => (
                <option key={level} value={level}>
                  Nível {level}
                </option>
              ))}
            </Select>
          </div>
          {error ? (
            <p className="sm:col-span-2 text-sm text-danger">{error}</p>
          ) : null}
          <div className="sm:col-span-2">
            <Button
              type="button"
              disabled={submitting}
              onClick={() => void handleLevelUp()}
            >
              {submitting ? "Salvando…" : "Confirmar level-up"}
            </Button>
          </div>
        </div>
      ) : null}
    </Surface>
  );
}
