import type {
  BuilderClassSpellcasting,
  BuilderSpellOption,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";

export {
  wizardSpellbookCount,
  WIZARD_SPELLBOOK_LEVEL1_COUNT,
} from "@/features/character-builder/domain/progression/spell-progression";

export const BUILDER_SPELL_LEVEL = 1;

/**
 * Contagens nível 1 (PHB 2024) — usadas quando `spell_knowledge_by_level`
 * ainda não foi aplicado no Supabase (migration 000033).
 */
export const SPELL_KNOWLEDGE_LEVEL1_FALLBACK: Record<string, number> = {
  wizard: 3,
  "wizard-prepared": 4,
  bard: 2,
  "bard-prepared": 4,
  cleric: 3,
  "cleric-prepared": 4,
  druid: 2,
  "druid-prepared": 4,
  sorcerer: 4,
  "sorcerer-prepared": 2,
  warlock: 2,
  "warlock-prepared": 2,
  "paladin-prepared": 2,
  "ranger-prepared": 2,
};

export function resolvePreparedProgressionSlug(
  cantripProgression: string | null,
  preparedProgressionSlug: string | null,
  className?: string,
): string | null {
  if (preparedProgressionSlug) return preparedProgressionSlug;
  if (cantripProgression && cantripProgression !== "none") {
    return `${cantripProgression}-prepared`;
  }
  if (className === "Paladin") return "paladin-prepared";
  if (className === "Ranger") return "ranger-prepared";
  return null;
}

export function spellKnowledgeCount(
  slug: string | null | undefined,
  classLevel: number,
  dbCounts: Map<string, number>,
): number {
  if (!slug || slug === "none") return 0;
  const fromDb = dbCounts.get(slug);
  if (fromDb !== undefined && fromDb > 0) return fromDb;
  if (classLevel === BUILDER_SPELL_LEVEL) {
    return SPELL_KNOWLEDGE_LEVEL1_FALLBACK[slug] ?? 0;
  }
  return 0;
}

export function totalSpellChoicesRequired(
  spellcasting: BuilderClassSpellcasting | null | undefined,
): number {
  if (!spellcasting) return 0;
  return (
    spellcasting.cantrip_count +
    spellcasting.prepared_count +
    spellcasting.spellbook_count
  );
}

export function mapSpellRows(
  rows: {
    spell_id: number;
    spells:
      | {
          id: number;
          name: string;
          level: number;
          school: string | null;
          requires_concentration: boolean;
          requires_ritual: boolean;
          casting_time?: string | null;
          range_text?: string | null;
          components?: string | null;
          material_component?: string | null;
          duration_text?: string | null;
          save_attribute?: string | null;
          attack_type?: string | null;
          description?: string | null;
          character_effect_summary?: string | null;
        }
      | {
          id: number;
          name: string;
          level: number;
          school: string | null;
          requires_concentration: boolean;
          requires_ritual: boolean;
          casting_time?: string | null;
          range_text?: string | null;
          components?: string | null;
          material_component?: string | null;
          duration_text?: string | null;
          save_attribute?: string | null;
          attack_type?: string | null;
          description?: string | null;
          character_effect_summary?: string | null;
        }[]
      | null;
  }[],
): BuilderSpellOption[] {
  const mapped: BuilderSpellOption[] = [];

  for (const row of rows) {
    const spell = Array.isArray(row.spells) ? row.spells[0] : row.spells;
    if (!spell) continue;

    mapped.push({
      spell_id: spell.id,
      name: spell.name,
      level: spell.level,
      school: spell.school,
      requires_concentration: spell.requires_concentration,
      requires_ritual: spell.requires_ritual,
      casting_time: spell.casting_time ?? null,
      range_text: spell.range_text ?? null,
      components: spell.components ?? null,
      material_component: spell.material_component ?? null,
      duration_text: spell.duration_text ?? null,
      save_attribute: spell.save_attribute ?? null,
      attack_type: spell.attack_type ?? null,
      character_effect_summary: spell.character_effect_summary?.trim() || null,
      description: spell.description?.trim() || null,
    });
  }

  return mapped.sort((a, b) =>
    a.level !== b.level
      ? a.level - b.level
      : a.name.localeCompare(b.name, "pt-BR"),
  );
}

export function classRequiresSpellSelection(
  spellcasting: BuilderClassSpellcasting | null | undefined,
): boolean {
  if (!spellcasting) return false;
  return (
    spellcasting.cantrip_count > 0 ||
    spellcasting.prepared_count > 0 ||
    spellcasting.spellbook_count > 0
  );
}

export function cantripsForClass(
  spellcasting: BuilderClassSpellcasting,
): BuilderClassSpellcasting["spells"] {
  return spellcasting.spells.filter((spell) => spell.level === 0);
}

export function level1SpellsForClass(
  spellcasting: BuilderClassSpellcasting,
): BuilderClassSpellcasting["spells"] {
  return leveledSpellsForClass(spellcasting, 1);
}

export const MAGICAL_SECRETS_UNLOCK_LEVEL = 10;

export const MAGICAL_SECRETS_SPELL_LISTS = [
  "Bard",
  "Cleric",
  "Druid",
  "Wizard",
] as const;

export function bardUsesMagicalSecrets(
  className: string,
  classLevel: number,
): boolean {
  return className === "Bard" && classLevel >= MAGICAL_SECRETS_UNLOCK_LEVEL;
}

export function leveledSpellsForClass(
  spellcasting: BuilderClassSpellcasting,
  maxLevel?: number,
): BuilderClassSpellcasting["spells"] {
  const cap = maxLevel ?? spellcasting.max_spell_level ?? 1;
  const source = spellcasting.prepared_spell_pool ?? spellcasting.spells;
  return source.filter(
    (spell) => spell.level >= 1 && spell.level <= cap,
  );
}

export function preparedSpellPoolForClass(
  spellcasting: BuilderClassSpellcasting,
  maxLevel?: number,
): BuilderClassSpellcasting["spells"] {
  return leveledSpellsForClass(spellcasting, maxLevel);
}

function spellLevelLabel(maxLevel: number): string {
  return maxLevel <= 1 ? "nível 1" : `nível 1–${maxLevel}`;
}

export function validateSpellSelections(
  spellcasting: BuilderClassSpellcasting | null | undefined,
  state: CharacterBuilderState,
): string | null {
  if (!classRequiresSpellSelection(spellcasting) || !spellcasting) {
    return null;
  }

  const maxLevel = spellcasting.max_spell_level ?? 1;
  const cantripPool = new Set(cantripsForClass(spellcasting).map((s) => s.spell_id));
  const classLeveledPool = new Set(
    leveledSpellsForClass(spellcasting, maxLevel).map((s) => s.spell_id),
  );
  const preparedPool = new Set(
    preparedSpellPoolForClass(spellcasting, maxLevel).map((s) => s.spell_id),
  );

  if (state.cantrip_spell_ids.length !== spellcasting.cantrip_count) {
    return `Selecione ${spellcasting.cantrip_count} truque(s) de classe.`;
  }

  for (const id of state.cantrip_spell_ids) {
    if (!cantripPool.has(id)) {
      return "Truque inválido para a lista da classe.";
    }
  }

  if (spellcasting.uses_spellbook) {
    if (state.spellbook_spell_ids.length !== spellcasting.spellbook_count) {
      return `Adicione ${spellcasting.spellbook_count} magia(s) (${spellLevelLabel(maxLevel)}) ao grimório.`;
    }
    for (const id of state.spellbook_spell_ids) {
      if (!classLeveledPool.has(id)) {
        return `Magia de grimório inválida (máx. ${spellLevelLabel(maxLevel)}).`;
      }
    }
  } else if (state.spellbook_spell_ids.length > 0) {
    return "Esta classe não usa grimório na criação.";
  }

  if (state.prepared_spell_ids.length !== spellcasting.prepared_count) {
    return `Selecione ${spellcasting.prepared_count} magia(s) preparada(s).`;
  }

  const preparedAllowed = spellcasting.uses_spellbook
    ? new Set(state.spellbook_spell_ids)
    : preparedPool;

  for (const id of state.prepared_spell_ids) {
    if (!preparedAllowed.has(id)) {
      return spellcasting.uses_spellbook
        ? "Magias preparadas devem estar no grimório."
        : spellcasting.uses_magical_secrets
          ? `Magia preparada inválida para Magical Secrets (máx. ${spellLevelLabel(maxLevel)}).`
          : `Magia preparada inválida (máx. ${spellLevelLabel(maxLevel)}).`;
    }
  }

  return null;
}

export function buildSpellsRpcPayload(state: CharacterBuilderState) {
  const entries = new Map<number, { is_prepared: boolean }>();

  for (const spellId of state.cantrip_spell_ids) {
    entries.set(spellId, { is_prepared: false });
  }

  for (const spellId of state.spellbook_spell_ids) {
    if (!entries.has(spellId)) {
      entries.set(spellId, { is_prepared: false });
    }
  }

  for (const spellId of state.prepared_spell_ids) {
    entries.set(spellId, { is_prepared: true });
  }

  return [...entries.entries()].map(([spell_id, meta]) => ({
    spell_id,
    source_type: "class",
    is_prepared: meta.is_prepared,
    always_prepared: false,
  }));
}

export function toggleSpellId(
  list: number[],
  spellId: number,
  max: number,
): number[] {
  if (list.includes(spellId)) {
    return list.filter((id) => id !== spellId);
  }
  if (list.length >= max) {
    return list;
  }
  return [...list, spellId];
}
