"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Surface } from "@/components/ui/Surface";
import { SheetDetailModal } from "@/features/character-sheet/components/sheet/SheetDetailModal";
import {
  featCategoryLabel,
  formatFeatSelectionKey,
  groupCharacterFeats,
} from "@/features/character-sheet/domain/sheet-sections/feats-display";
import { useCatalogSnippet } from "@/features/character-sheet/hooks/useCatalogSnippet";
import type { CharacterFeatSummary } from "@/shared/character";

type CharacterFeatsSectionProps = {
  characterId: number;
  feats: CharacterFeatSummary[];
};

export function CharacterFeatsSection({
  characterId,
  feats,
}: CharacterFeatsSectionProps) {
  const groups = groupCharacterFeats(feats);
  const [modalFeat, setModalFeat] = useState<CharacterFeatSummary | null>(null);
  const snippet = useCatalogSnippet(characterId);

  if (groups.length === 0) return null;

  const openFeatDetail = (feat: CharacterFeatSummary) => {
    setModalFeat(feat);
    snippet.fetchSnippet("feat", feat.feat_id);
  };

  const closeModal = () => {
    setModalFeat(null);
    snippet.reset();
  };

  return (
    <>
      <Surface className="p-5">
        <h2 className="text-sm font-medium text-foreground">Feats</h2>
        <div className="mt-4 space-y-4">
          {groups.map((group) => (
            <section key={group.sourceType}>
              <h3 className="text-xs font-medium text-muted-subtle">
                {group.sourceLabel}
              </h3>
              <ul className="mt-2 space-y-1.5">
                {group.feats.map((feat) => {
                  const selectionKey = formatFeatSelectionKey(feat.selection_key);
                  const category = featCategoryLabel(feat.category);
                  return (
                    <li
                      key={`${feat.feat_id}:${feat.selection_key ?? "default"}`}
                      className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-surface/30 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-foreground">{feat.name}</p>
                        {selectionKey || feat.notes ? (
                          <p className="mt-0.5 text-xs text-muted-subtle">
                            {[selectionKey, feat.notes].filter(Boolean).join(" · ")}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {category ? (
                          <Badge tone="neutral">{category}</Badge>
                        ) : null}
                        <button
                          type="button"
                          className="rounded-md p-1 text-muted-subtle transition-colors hover:text-foreground"
                          aria-label={`Detalhes de ${feat.name}`}
                          onClick={() => openFeatDetail(feat)}
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
        open={modalFeat != null}
        title={modalFeat?.name ?? ""}
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
