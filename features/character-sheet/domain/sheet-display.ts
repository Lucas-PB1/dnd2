export type CharacterTraitEntry = {
  trait_id: number;
  trait_name: string;
  source_type: "class" | "subclass" | string;
  source_name: string;
  level_required: number | null;
};

export type CharacterResourceEntry = {
  trait_id: number | null;
  resource_key: string | null;
  name: string;
  max_uses: number;
  used_uses: number;
  reset_on: string | null;
};

const PASSIVE_TRAIT_SOURCES = new Set(["class", "subclass"]);

export function filterPassiveClassTraits(
  traits: CharacterTraitEntry[],
): CharacterTraitEntry[] {
  return traits
    .filter((entry) => PASSIVE_TRAIT_SOURCES.has(entry.source_type))
    .sort((a, b) => {
      const levelA = a.level_required ?? 0;
      const levelB = b.level_required ?? 0;
      if (levelA !== levelB) return levelA - levelB;
      if (a.source_type !== b.source_type) {
        return a.source_type === "class" ? -1 : 1;
      }
      return a.trait_name.localeCompare(b.trait_name, "pt-BR");
    });
}

export function groupTraitsBySource(
  traits: CharacterTraitEntry[],
): { source: string; traits: CharacterTraitEntry[] }[] {
  const filtered = filterPassiveClassTraits(traits);
  const groups = new Map<string, CharacterTraitEntry[]>();

  for (const entry of filtered) {
    const key = entry.source_name;
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }

  return Array.from(groups.entries()).map(([source, entries]) => ({
    source,
    traits: entries,
  }));
}

export function formatTraitLevel(level: number | null): string | null {
  if (level == null || level <= 0) return null;
  return `Nv ${level}`;
}

export function formatProficiencyBonus(bonus: number): string {
  return bonus >= 0 ? `+${bonus}` : String(bonus);
}

export function formatResourceUses(entry: CharacterResourceEntry): string {
  const remaining = entry.max_uses - entry.used_uses;
  return `${remaining}/${entry.max_uses}`;
}

export function resourceResetLabel(resetOn: string | null): string | null {
  if (!resetOn) return null;
  if (resetOn === "Short Rest") return "Descanso curto";
  if (resetOn === "Long Rest") return "Descanso longo";
  if (resetOn === "Dawn") return "Amanhecer";
  return resetOn;
}
