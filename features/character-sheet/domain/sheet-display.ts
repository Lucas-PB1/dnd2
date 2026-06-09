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

export type AbilityLike = {
  ability: string;
};

export type SkillLike = {
  skill: string;
  base_attribute: string;
  modifier: number;
};

export type ProficiencyLike = {
  proficiency_type: string;
  name: string;
};

export type SpellLike = {
  name: string;
  level: number;
};

export type InventoryLike = {
  name: string;
  item_type: string;
  is_equipped: boolean;
  is_attuned: boolean;
  quantity: number;
};

const PASSIVE_TRAIT_SOURCES = new Set(["class", "subclass"]);
const ABILITY_ORDER = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const ABILITY_LABELS: Record<string, string> = {
  STR: "Força",
  DEX: "Destreza",
  CON: "Constituição",
  INT: "Inteligência",
  WIS: "Sabedoria",
  CHA: "Carisma",
};

const PROFICIENCY_LABELS: Record<string, string> = {
  armor: "Armaduras",
  language: "Idiomas",
  other: "Outras",
  save: "Salvaguardas",
  tool: "Ferramentas",
  weapon: "Armas",
};

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

export function groupAllTraitsBySource(
  traits: CharacterTraitEntry[],
): { source: string; traits: CharacterTraitEntry[] }[] {
  const groups = new Map<string, CharacterTraitEntry[]>();

  for (const entry of traits) {
    const key = entry.source_name;
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }

  return Array.from(groups.entries()).map(([source, entries]) => ({
    source,
    traits: entries.sort((a, b) => {
      const levelA = a.level_required ?? 0;
      const levelB = b.level_required ?? 0;
      if (levelA !== levelB) return levelA - levelB;
      return a.trait_name.localeCompare(b.trait_name, "pt-BR");
    }),
  }));
}

export function formatTraitLevel(level: number | null): string | null {
  if (level == null || level <= 0) return null;
  return `Nv ${level}`;
}

export function formatProficiencyBonus(bonus: number): string {
  return bonus >= 0 ? `+${bonus}` : String(bonus);
}

export function abilityLabel(ability: string | null | undefined): string {
  if (!ability) return "—";
  return ABILITY_LABELS[ability] ?? ability;
}

export function abilitySortValue(ability: string): number {
  const index = ABILITY_ORDER.indexOf(ability);
  return index === -1 ? ABILITY_ORDER.length : index;
}

export function sortByAbility<T extends AbilityLike>(entries: T[]): T[] {
  return [...entries].sort(
    (a, b) => abilitySortValue(a.ability) - abilitySortValue(b.ability),
  );
}

export function sortSkills<T extends SkillLike>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const abilityDiff =
      abilitySortValue(a.base_attribute) - abilitySortValue(b.base_attribute);
    if (abilityDiff !== 0) return abilityDiff;
    return a.skill.localeCompare(b.skill, "pt-BR");
  });
}

export function passivePerception(skills: SkillLike[]): number | null {
  const perception = skills.find(
    (entry) => entry.skill.toLowerCase() === "perception",
  );
  return perception ? 10 + perception.modifier : null;
}

export function groupProficiencies(
  entries: ProficiencyLike[],
): { label: string; entries: ProficiencyLike[] }[] {
  const groups = new Map<string, ProficiencyLike[]>();

  for (const entry of entries) {
    const list = groups.get(entry.proficiency_type) ?? [];
    list.push(entry);
    groups.set(entry.proficiency_type, list);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => proficiencyLabel(a).localeCompare(proficiencyLabel(b), "pt-BR"))
    .map(([type, list]) => ({
      label: proficiencyLabel(type),
      entries: list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    }));
}

export function proficiencyLabel(type: string): string {
  return PROFICIENCY_LABELS[type] ?? type;
}

export function sortSpells<T extends SpellLike>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.name.localeCompare(b.name, "pt-BR");
  });
}

export function spellLevelLabel(level: number): string {
  return level === 0 ? "Truque" : `Nível ${level}`;
}

export function sortInventory<T extends InventoryLike>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    if (a.is_equipped !== b.is_equipped) return a.is_equipped ? -1 : 1;
    if (a.item_type !== b.item_type) return a.item_type.localeCompare(b.item_type, "pt-BR");
    if (a.is_attuned !== b.is_attuned) return a.is_attuned ? -1 : 1;
    return a.name.localeCompare(b.name, "pt-BR");
  });
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
