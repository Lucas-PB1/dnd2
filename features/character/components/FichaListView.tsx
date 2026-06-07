"use client";

import { useRouter } from "next/navigation";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { Button } from "@/components/ui/Button";
import type { CharacterSummary } from "@/features/character/types/character.types";
import { CharacterCard } from "@/features/character/components/CharacterCard";

type FichaListViewProps = {
  initialCharacters: CharacterSummary[];
};

export function FichaListView({ initialCharacters }: FichaListViewProps) {
  const router = useRouter();
  const hasCharacters = initialCharacters.length > 0;

  return (
    <section aria-labelledby="ficha-heading">
      <FadeIn>
        <h1
          id="ficha-heading"
          className="font-serif text-3xl font-bold text-foreground"
        >
          Suas fichas
        </h1>
      </FadeIn>

      <FadeIn delay={0.08}>
        <p className="mt-2 text-muted">
          Personagens existem independentemente das campanhas. Depois você pode
          vinculá-los a uma mesa.
        </p>
      </FadeIn>

      <FadeIn delay={0.14} className="mt-8">
        <Button
          type="button"
          className="sm:!w-auto sm:min-w-44"
          onClick={() => router.push("/ficha/novo")}
        >
          Novo personagem
        </Button>
      </FadeIn>

      {hasCharacters ? (
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2">
          {initialCharacters.map((character) => (
            <StaggerItem key={character.id}>
              <CharacterCard character={character} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <FadeIn delay={0.2} className="mt-10">
          <div className="rounded-2xl border border-dashed border-border-strong bg-surface/40 p-8 text-center">
            <p className="text-lg text-foreground/90">Nenhum personagem ainda</p>
            <p className="mt-2 text-sm text-muted-subtle">
              Crie sua primeira ficha para começar a aventura.
            </p>
          </div>
        </FadeIn>
      )}
    </section>
  );
}
