import type { CharacterTraitEntry } from "@/features/character-sheet/domain/sheet-display";
import { formatTraitLevel } from "@/features/character-sheet/domain/sheet-display";

const SOURCE_TYPE_LABELS: Record<string, string> = {
  species: "Espécie",
  class: "Classe",
  subclass: "Subclasse",
  feat: "Feat",
  item: "Item",
  background: "Antecedente",
  trait_option: "Escolha de traço",
};

export function traitSourceTypeLabel(sourceType: string): string {
  return SOURCE_TYPE_LABELS[sourceType] ?? sourceType;
}

export type TraitSourceGroup = {
  sourceType: string;
  sourceLabel: string;
  sourceName: string;
  traits: CharacterTraitEntry[];
};

export function groupTraitsBySourceType(
  traits: CharacterTraitEntry[],
): TraitSourceGroup[] {
  const groups = new Map<string, CharacterTraitEntry[]>();

  for (const trait of traits) {
    const key = `${trait.source_type}::${trait.source_name}`;
    const list = groups.get(key) ?? [];
    list.push(trait);
    groups.set(key, list);
  }

  const sourceOrder = ["species", "class", "subclass", "feat", "item", "background"];

  return Array.from(groups.entries())
    .map(([key, entries]) => {
      const [sourceType, sourceName] = key.split("::");
      return {
        sourceType,
        sourceLabel: traitSourceTypeLabel(sourceType),
        sourceName,
        traits: entries.sort((a, b) => {
          const levelA = a.level_required ?? 0;
          const levelB = b.level_required ?? 0;
          if (levelA !== levelB) return levelA - levelB;
          return a.trait_name.localeCompare(b.trait_name, "pt-BR");
        }),
      };
    })
    .sort((a, b) => {
      const orderA = sourceOrder.indexOf(a.sourceType);
      const orderB = sourceOrder.indexOf(b.sourceType);
      const idxA = orderA === -1 ? sourceOrder.length : orderA;
      const idxB = orderB === -1 ? sourceOrder.length : orderB;
      if (idxA !== idxB) return idxA - idxB;
      return a.sourceName.localeCompare(b.sourceName, "pt-BR");
    });
}

export function traitSubtitle(trait: CharacterTraitEntry): string | null {
  return formatTraitLevel(trait.level_required);
}
