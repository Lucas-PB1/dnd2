"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, X } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { FadeIn } from "@/components/motion";
import {
  createCharacter,
  fetchCharacterCatalog,
} from "@/features/character-builder/services/create.service";
import {
  CHARACTER_NAME_MIN,
  type CharacterCatalog,
} from "@/features/character-sheet/types/character.types";

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
  const selectClassName = "mt-1.5 disabled:opacity-50";

  return (
    <FadeIn className="editorial-surface rounded-lg p-6">
      <Link
        href="/ficha"
        transitionTypes={["nav-back"]}
        className="inline-flex items-center gap-1.5 text-sm text-brand transition-colors hover:text-brand-hover"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Voltar às fichas
      </Link>

      <h1 className="mt-4 font-serif text-2xl font-semibold text-foreground">
        Novo personagem
      </h1>
      <p className="mt-1 text-sm text-muted">
        Escolha nome, espécie, antecedente e classe. Proficiências e feat de
        origem são aplicados automaticamente.
      </p>

      {catalogError ? (
        <Alert variant="error" className="mt-5">{catalogError}</Alert>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {error ? (
          <Alert variant="error">{error}</Alert>
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
          <Select
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
          </Select>
        </div>

        <div>
          <Label htmlFor="character-background">Antecedente</Label>
          <Select
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
          </Select>
        </div>

        <div>
          <Label htmlFor="character-class">Classe (nível 1)</Label>
          <Select
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
          </Select>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Button
            type="submit"
            loading={loading}
            disabled={!catalogReady}
            icon={<Sparkles className="size-4" />}
            className="sm:!w-auto"
          >
            Criar personagem
          </Button>
          <Button
            type="button"
            variant="ghost"
            icon={<X className="size-4" />}
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
