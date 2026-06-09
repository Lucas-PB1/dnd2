"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { SheetDetailModal } from "@/features/character-sheet/components/sheet/SheetDetailModal";
import type { CharacterTraitEntry } from "@/features/character-sheet/domain/sheet-display";
import {
  groupTraitsBySourceType,
  traitSubtitle,
} from "@/features/character-sheet/domain/sheet-sections/traits-display";
import { useCatalogSnippet } from "@/features/character-sheet/hooks/useCatalogSnippet";

type CharacterTraitsSectionProps = {
  characterId: number;
  traits: CharacterTraitEntry[];
};

export function CharacterTraitsSection({
  characterId,
  traits,
}: CharacterTraitsSectionProps) {
  const groups = groupTraitsBySourceType(traits);
  const [modalTrait, setModalTrait] = useState<CharacterTraitEntry | null>(null);
  const snippet = useCatalogSnippet(characterId);

  if (groups.length === 0) return null;

  const openTraitDetail = (trait: CharacterTraitEntry) => {
    setModalTrait(trait);
    snippet.fetchSnippet("trait", trait.trait_id);
  };

  const closeModal = () => {
    setModalTrait(null);
    snippet.reset();
  };

  return (
    <>
      <Surface className="p-6">
        <h2 className="text-sm font-medium text-foreground">Traços e features</h2>
        <div className="mt-4 space-y-4">
          {groups.map((group) => (
            <section key={`${group.sourceType}:${group.sourceName}`}>
              <h3 className="text-xs font-medium text-muted-subtle">
                {group.sourceLabel} · {group.sourceName}
              </h3>
              <ul className="mt-2 space-y-1.5">
                {group.traits.map((entry) => {
                  const levelLabel = traitSubtitle(entry);
                  return (
                    <li
                      key={`${entry.source_type}:${entry.source_name}:${entry.trait_id}`}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="text-foreground">{entry.trait_name}</span>
                      <div className="flex shrink-0 items-center gap-2">
                        {levelLabel ? (
                          <span className="text-xs tabular-nums text-muted-subtle">
                            {levelLabel}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          className="rounded-md p-1 text-muted-subtle transition-colors hover:text-foreground"
                          aria-label={`Detalhes de ${entry.trait_name}`}
                          onClick={() => openTraitDetail(entry)}
                        >
                          <Info className="size-4" aria-hidden />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </Surface>

      <SheetDetailModal
        open={modalTrait != null}
        title={modalTrait?.trait_name ?? ""}
        onClose={closeModal}
      >
        {snippet.loading ? (
          <p>Carregando…</p>
        ) : snippet.error ? (
          <p>{snippet.error}</p>
        ) : snippet.description ? (
          <p className="whitespace-pre-wrap">{snippet.description}</p>
        ) : (
          <p className="text-muted-subtle">Sem descrição disponível.</p>
        )}
      </SheetDetailModal>
    </>
  );
}
