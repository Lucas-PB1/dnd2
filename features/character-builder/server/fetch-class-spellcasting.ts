import { ApiError } from "@/lib/api/errors";
import {
  wizardSpellbookCount,
  maxSpellSlotLevel,
  spellcastingProgressionForClass,
} from "@/features/character-builder/domain/progression/spell-progression";
import {
  bardUsesMagicalSecrets,
  MAGICAL_SECRETS_SPELL_LISTS,
  mapSpellRows,
  resolvePreparedProgressionSlug,
  spellKnowledgeCount,
} from "@/features/character-builder/domain/spells/class-spells";
import type {
  BuilderClassSpellcasting,
  BuilderSpellOption,
} from "@/features/character-builder/types/builder.types";
import type { BuilderAdminClient, ClassSpellcastingRow } from "./types";
import { normalizeBuilderClassLevel } from "./types";

function classNameFromJoin(
  joined: { name: string } | { name: string }[] | null | undefined,
): string | undefined {
  if (!joined) return undefined;
  return Array.isArray(joined) ? joined[0]?.name : joined.name;
}

async function fetchSpellKnowledgeCounts(
  admin: BuilderAdminClient,
  slugs: string[],
  classLevel: number,
): Promise<Map<string, number>> {
  const uniqueSlugs = [
    ...new Set(slugs.filter((slug) => slug && slug !== "none")),
  ];
  const counts = new Map<string, number>();
  if (!uniqueSlugs.length) return counts;

  const { data, error } = await admin
    .from("spell_knowledge_by_level")
    .select("progression_slug, knowledge_count")
    .eq("class_level", classLevel)
    .in("progression_slug", uniqueSlugs);

  if (error) throw new ApiError(error.message, 400);

  for (const row of data ?? []) {
    counts.set(row.progression_slug, row.knowledge_count ?? 0);
  }

  for (const slug of uniqueSlugs) {
    if (!counts.has(slug) || (counts.get(slug) ?? 0) === 0) {
      const fallback = spellKnowledgeCount(slug, classLevel, counts);
      if (fallback > 0) counts.set(slug, fallback);
    }
  }

  return counts;
}

function buildSpellcastingEntry(
  row: ClassSpellcastingRow,
  knowledgeBySlug: Map<string, number>,
  spells: BuilderSpellOption[],
  classLevel: number,
  className?: string,
): BuilderClassSpellcasting | null {
  const level = normalizeBuilderClassLevel(classLevel);
  const preparedSlug = resolvePreparedProgressionSlug(
    row.cantrip_progression,
    row.prepared_progression_slug,
    className,
  );

  const cantripCount = spellKnowledgeCount(
    row.cantrip_progression,
    level,
    knowledgeBySlug,
  );
  const preparedCount = spellKnowledgeCount(
    preparedSlug,
    level,
    knowledgeBySlug,
  );

  if (cantripCount === 0 && preparedCount === 0) {
    return null;
  }

  const progression = className
    ? spellcastingProgressionForClass(className)
    : "none";

  return {
    spellcasting_ability: row.spellcasting_ability,
    cantrip_count: cantripCount,
    prepared_count: preparedCount,
    spellbook_count: row.uses_spellbook ? wizardSpellbookCount(level) : 0,
    uses_spellbook: row.uses_spellbook,
    max_spell_level: maxSpellSlotLevel(level, progression),
    spells,
  };
}

async function fetchSpellsForClassName(
  admin: BuilderAdminClient,
  className: string,
): Promise<BuilderSpellOption[]> {
  const { data: listRow, error: listError } = await admin
    .from("spell_lists")
    .select("id")
    .eq("name", className)
    .eq("source_type", "class")
    .maybeSingle();

  if (listError) throw new ApiError(listError.message, 400);
  if (!listRow?.id) return [];

  const { data: spellRows, error: spellError } = await admin
    .from("spell_list_spells")
    .select(
      "spell_id, spells(id, name, level, school, requires_concentration, requires_ritual, casting_time, range_text, components, material_component, duration_text, save_attribute, attack_type, description, character_effect_summary)",
    )
    .eq("spell_list_id", listRow.id);

  if (spellError) throw new ApiError(spellError.message, 400);
  return mapSpellRows(spellRows ?? []);
}

function mergeSpellOptions(
  lists: BuilderSpellOption[][],
): BuilderSpellOption[] {
  const byId = new Map<number, BuilderSpellOption>();
  for (const spells of lists) {
    for (const spell of spells) {
      byId.set(spell.spell_id, spell);
    }
  }
  return [...byId.values()].sort((a, b) =>
    a.level !== b.level
      ? a.level - b.level
      : a.name.localeCompare(b.name, "pt-BR"),
  );
}

async function fetchPreparedSpellPool(
  admin: BuilderAdminClient,
  className: string,
  classLevel: number,
): Promise<BuilderSpellOption[] | undefined> {
  if (!bardUsesMagicalSecrets(className, classLevel)) {
    return undefined;
  }

  const lists = await Promise.all(
    MAGICAL_SECRETS_SPELL_LISTS.map((name) =>
      fetchSpellsForClassName(admin, name),
    ),
  );
  return mergeSpellOptions(lists);
}

export async function fetchAllClassSpellcasting(
  admin: BuilderAdminClient,
  classLevel: number,
): Promise<Map<number, BuilderClassSpellcasting | null>> {
  const level = normalizeBuilderClassLevel(classLevel);
  const { data: rows, error } = await admin
    .from("class_spellcasting")
    .select(
      "class_id, spellcasting_ability, cantrip_progression, prepared_progression_slug, uses_spellbook, classes(name)",
    );

  if (error) throw new ApiError(error.message, 400);

  const slugs = (rows ?? []).flatMap((row) => {
    const className = classNameFromJoin(
      row.classes as { name: string } | { name: string }[] | null,
    );
    return [
      row.cantrip_progression,
      row.prepared_progression_slug,
      resolvePreparedProgressionSlug(
        row.cantrip_progression,
        row.prepared_progression_slug,
        className,
      ),
    ];
  });
  const knowledgeBySlug = await fetchSpellKnowledgeCounts(admin, slugs, level);

  const result = new Map<number, BuilderClassSpellcasting | null>();
  for (const row of rows ?? []) {
    const className = classNameFromJoin(
      row.classes as { name: string } | { name: string }[] | null,
    );
    const entry = buildSpellcastingEntry(
      row,
      knowledgeBySlug,
      [],
      level,
      className,
    );
    if (entry) {
      result.set(row.class_id, entry);
    }
  }
  return result;
}

export async function fetchClassSpellcasting(
  admin: BuilderAdminClient,
  classId: number,
  className: string,
  classLevel: number,
): Promise<BuilderClassSpellcasting | null> {
  const level = normalizeBuilderClassLevel(classLevel);
  const { data: castingRow, error: castingError } = await admin
    .from("class_spellcasting")
    .select(
      "class_id, spellcasting_ability, cantrip_progression, prepared_progression_slug, uses_spellbook",
    )
    .eq("class_id", classId)
    .maybeSingle();

  if (castingError) throw new ApiError(castingError.message, 400);
  if (!castingRow) return null;

  const preparedSlug = resolvePreparedProgressionSlug(
    castingRow.cantrip_progression,
    castingRow.prepared_progression_slug,
    className,
  );
  const knowledgeBySlug = await fetchSpellKnowledgeCounts(
    admin,
    [castingRow.cantrip_progression, castingRow.prepared_progression_slug, preparedSlug],
    level,
  );

  const base = buildSpellcastingEntry(
    castingRow,
    knowledgeBySlug,
    [],
    level,
    className,
  );
  if (!base) return null;

  const spells = await fetchSpellsForClassName(admin, className);
  const preparedSpellPool = await fetchPreparedSpellPool(
    admin,
    className,
    level,
  );

  return {
    ...base,
    spells,
    prepared_spell_pool: preparedSpellPool,
    uses_magical_secrets: preparedSpellPool !== undefined,
  };
}
