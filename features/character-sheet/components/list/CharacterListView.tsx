"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, UserPlus } from "lucide-react";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";
import type { CharacterSummary } from "@/shared/character";
import { CharacterCard } from "./CharacterCard";

type CharacterListViewProps = {
  initialCharacters: CharacterSummary[];
};

export function CharacterListView({ initialCharacters }: CharacterListViewProps) {
  const router = useRouter();
  const [characters, setCharacters] = useState(initialCharacters);
  const hasCharacters = characters.length > 0;

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
          icon={<UserPlus className="size-4" />}
          className="sm:w-auto! sm:min-w-44"
          onClick={() => router.push("/ficha/novo")}
        >
          Novo personagem
        </Button>
      </FadeIn>

      {hasCharacters ? (
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6">
          {characters.map((character) => (
            <StaggerItem key={character.id} className="h-full min-w-0">
              <CharacterCard
                character={character}
                onDeleted={(characterId) =>
                  setCharacters((prev) =>
                    prev.filter((entry) => entry.id !== characterId),
                  )
                }
              />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <FadeIn delay={0.2} className="mt-10">
          <Surface tone="dashed" className="p-8 text-center">
            <span className="mx-auto flex size-11 items-center justify-center rounded-lg border border-accent/25 bg-accent-muted/20 text-accent-soft">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <p className="mt-4 text-lg text-foreground/90">Nenhum personagem ainda</p>
            <p className="mt-2 text-sm text-muted-subtle">
              Crie sua primeira ficha para começar a aventura.
            </p>
          </Surface>
        </FadeIn>
      )}
    </section>
  );
}
