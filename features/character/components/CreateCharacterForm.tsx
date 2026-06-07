"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/motion";
import {
  createCharacter,
  fetchCharacterCatalog,
} from "@/features/character/services/character.service";
import {
  CHARACTER_NAME_MIN,
  type CharacterCatalog,
} from "@/features/character/types/character.types";

const selectClassName =
  "mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50";

export function CreateCharacterForm() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<CharacterCatalog | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [speciesId, setSpeciesId] = useState("");
  const [backgroundId, setBackgroundId] = useState("");
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCharacterCatalog()
      .then(setCatalog)
      .catch((err) =>
        setCatalogError(
          err instanceof Error ? err.message : "Não foi possível carregar o catálogo.",
        ),
      );
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (trimmedName.length < CHARACTER_NAME_MIN) {
      setError(`Informe um nome com pelo menos ${CHARACTER_NAME_MIN} caracteres.`);
      return;
    }

    const species_id = Number(speciesId);
    const background_id = Number(backgroundId);
    const class_id = Number(classId);

    if (!species_id || !background_id || !class_id) {
      setError("Selecione espécie, antecedente e classe.");
      return;
    }

    setLoading(true);

    try {
      const result = await createCharacter({
        name: trimmedName,
        species_id,
        background_id,
        class_id,
      });
      router.push(`/ficha/${result.character_id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível criar o personagem.",
      );
    } finally {
      setLoading(false);
    }
  };

  const catalogReady = catalog !== null;

  return (
    <FadeIn className="rounded-2xl border border-border bg-surface/50 p-6">
      <Link
        href="/ficha"
        className="text-sm text-brand transition-colors hover:text-brand-hover"
      >
        ← Voltar às fichas
      </Link>

      <h1 className="mt-4 font-serif text-2xl font-semibold text-foreground">
        Novo personagem
      </h1>
      <p className="mt-1 text-sm text-muted">
        Escolha nome, espécie, antecedente e classe. Proficiências e feat de
        origem são aplicados automaticamente.
      </p>

      {catalogError ? (
        <p className="mt-5 rounded-lg border border-danger/30 bg-danger-surface px-4 py-3 text-sm text-danger" role="alert">
          {catalogError}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {error ? (
          <p className="rounded-lg border border-danger/30 bg-danger-surface px-4 py-3 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div>
          <Label htmlFor="character-name">Nome</Label>
          <Input
            id="character-name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aldric"
            required
            maxLength={255}
            className="mt-1.5"
            disabled={!catalogReady}
          />
        </div>

        <div>
          <Label htmlFor="character-species">Espécie</Label>
          <select
            id="character-species"
            name="species_id"
            value={speciesId}
            onChange={(e) => setSpeciesId(e.target.value)}
            required
            disabled={!catalogReady}
            className={selectClassName}
          >
            <option value="">Selecione…</option>
            {catalog?.species.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="character-background">Antecedente</Label>
          <select
            id="character-background"
            name="background_id"
            value={backgroundId}
            onChange={(e) => setBackgroundId(e.target.value)}
            required
            disabled={!catalogReady}
            className={selectClassName}
          >
            <option value="">Selecione…</option>
            {catalog?.backgrounds.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="character-class">Classe (nível 1)</Label>
          <select
            id="character-class"
            name="class_id"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            required
            disabled={!catalogReady}
            className={selectClassName}
          >
            <option value="">Selecione…</option>
            {catalog?.classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Button type="submit" loading={loading} disabled={!catalogReady} className="sm:!w-auto">
            Criar personagem
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="sm:!w-auto"
            disabled={loading}
            onClick={() => router.push("/ficha")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </FadeIn>
  );
}
