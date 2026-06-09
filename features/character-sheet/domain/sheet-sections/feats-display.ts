import type { CharacterFeatSummary } from "@/features/character-sheet/types/character.types";

const SOURCE_LABELS: Record<string, string> = {
  background: "Antecedente",
  species: "Espécie",
  class: "Classe",
  subclass: "Subclasse",
  player: "Jogador",
  progression: "Progressão",
  origin: "Origem",
  human: "Humano",
};

const CATEGORY_LABELS: Record<string, string> = {
  Origin: "Origem",
  General: "Geral",
  "Fighting Style": "Estilo de luta",
  "Epic Boon": "Dádiva épica",
  Other: "Outro",
};

export function featSourceLabel(sourceType: string): string {
  return SOURCE_LABELS[sourceType] ?? sourceType;
}

export function featCategoryLabel(category: string | null): string | null {
  if (!category) return null;
  return CATEGORY_LABELS[category] ?? category;
}

export type FeatGroup = {
  sourceLabel: string;
  sourceType: string;
  feats: CharacterFeatSummary[];
};

export function groupCharacterFeats(feats: CharacterFeatSummary[]): FeatGroup[] {
  const groups = new Map<string, CharacterFeatSummary[]>();

  for (const feat of feats) {
    const list = groups.get(feat.source_type) ?? [];
    list.push(feat);
    groups.set(feat.source_type, list);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => featSourceLabel(a).localeCompare(featSourceLabel(b), "pt-BR"))
    .map(([sourceType, entries]) => ({
      sourceType,
      sourceLabel: featSourceLabel(sourceType),
      feats: entries.sort((a, b) => {
        const keyA = a.selection_key ?? "";
        const keyB = b.selection_key ?? "";
        if (keyA !== keyB) return keyA.localeCompare(keyB, "pt-BR");
        return a.name.localeCompare(b.name, "pt-BR");
      }),
    }));
}

export function formatFeatSelectionKey(
  selectionKey: string | null,
): string | null {
  if (!selectionKey || selectionKey === "default") return null;
  return selectionKey;
}
