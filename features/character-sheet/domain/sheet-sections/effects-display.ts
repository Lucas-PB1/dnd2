import type { CharacterActiveEffect } from "@/features/character-sheet/types/character.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

const ADJUSTMENT_LABELS: Record<string, string> = {
  resistance: "Resistência",
  immunity: "Imunidade",
  vulnerability: "Vulnerabilidade",
  absorption: "Absorção",
};

const OPERATION_LABELS: Record<string, string> = {
  add: "+",
  multiply: "×",
  set: "=",
  advantage: "Vantagem",
  disadvantage: "Desvantagem",
};

const PROFICIENCY_TYPE_LABELS: Record<string, string> = {
  skill: "perícia",
  language: "idioma",
  tool: "ferramenta",
  armor: "armadura",
  weapon: "arma",
  save: "salvaguarda",
  other: "outra",
};

function formatDamageAdjustment(entry: unknown): string | null {
  if (!isRecord(entry)) return null;
  const damageType = asString(entry.damage_type);
  const adjustmentType = asString(entry.adjustment_type);
  if (!damageType || !adjustmentType) return null;

  const label = ADJUSTMENT_LABELS[adjustmentType] ?? adjustmentType;
  const scope = asString(entry.scope_text);
  return scope ? `${label} a ${damageType} (${scope})` : `${label} a ${damageType}`;
}

function formatStatus(entry: unknown): string | null {
  if (!isRecord(entry)) return null;
  const status = asString(entry.status);
  if (!status) return null;

  const duration = asString(entry.duration_text);
  const scope = asString(entry.scope_text);
  const parts = [status, duration, scope].filter(Boolean);
  return parts.join(" · ");
}

function formatConditionAdjustment(entry: unknown): string | null {
  if (!isRecord(entry)) return null;
  const status = asString(entry.status);
  const adjustmentType = asString(entry.adjustment_type);
  if (!status || !adjustmentType) return null;

  const label = ADJUSTMENT_LABELS[adjustmentType] ?? adjustmentType;
  const scope = asString(entry.scope_text);
  return scope
    ? `${label} a ${status} (${scope})`
    : `${label} a ${status}`;
}

function formatModifier(entry: unknown): string | null {
  if (!isRecord(entry)) return null;
  const stat = asString(entry.affected_stat);
  if (!stat) return null;

  const operation = asString(entry.operation) ?? "add";
  const value = typeof entry.modifier_value === "number"
    ? entry.modifier_value
    : null;

  if (value == null) {
    const opLabel = OPERATION_LABELS[operation] ?? operation;
    return `${stat}: ${opLabel}`;
  }
  if (operation === "add") {
    const sign = value >= 0 ? "+" : "";
    return `${stat}: ${sign}${value}`;
  }
  const opLabel = OPERATION_LABELS[operation] ?? operation;
  return `${stat}: ${opLabel}${value}`;
}

function proficiencyTypeLabel(type: string | null): string | null {
  if (!type) return null;
  return PROFICIENCY_TYPE_LABELS[type] ?? type;
}

function formatProficiency(entry: unknown): string | null {
  if (!isRecord(entry)) return null;

  const name = asString(entry.name)
    ?? asString(entry.skill)
    ?? asString(entry.language)
    ?? asString(entry.tool);
  const type = asString(entry.proficiency_type);
  const typeLabel = proficiencyTypeLabel(type);
  const notes = asString(entry.notes);
  const requiresChoice = entry.requires_choice === true;
  const choiceCount =
    typeof entry.choice_count === "number" ? entry.choice_count : null;

  if (name) {
    return typeLabel ? `${name} (${typeLabel})` : name;
  }

  if (notes) return notes;

  if (requiresChoice && typeLabel && choiceCount != null) {
    return choiceCount === 1
      ? `Escolha 1 ${typeLabel}`
      : `Escolha ${choiceCount} ${typeLabel}s`;
  }

  return typeLabel;
}

function formatRecordFallback(entry: unknown): string | null {
  if (!isRecord(entry)) return null;

  const notes = asString(entry.notes);
  if (notes) return notes;

  const textFields = [
    entry.name,
    entry.skill,
    entry.language,
    entry.tool,
    entry.status,
    entry.damage_type,
    entry.affected_stat,
    entry.scope_text,
    entry.duration_text,
  ];

  for (const value of textFields) {
    const text = asString(value);
    if (text) return text;
  }

  return null;
}

export type FormattedEffectLine = {
  kind: "modifier" | "damage" | "status" | "condition" | "proficiency" | "raw";
  text: string;
};

export function formatEffectDetails(effect: CharacterActiveEffect): FormattedEffectLine[] {
  const lines: FormattedEffectLine[] = [];

  for (const entry of effect.modifiers) {
    const text = formatModifier(entry);
    if (text) lines.push({ kind: "modifier", text });
  }
  for (const entry of effect.damage_adjustments) {
    const text = formatDamageAdjustment(entry);
    if (text) lines.push({ kind: "damage", text });
  }
  for (const entry of effect.statuses) {
    const text = formatStatus(entry);
    if (text) lines.push({ kind: "status", text });
  }
  for (const entry of effect.condition_adjustments) {
    const text = formatConditionAdjustment(entry);
    if (text) lines.push({ kind: "condition", text });
  }
  for (const entry of effect.proficiencies) {
    const text = formatProficiency(entry);
    if (text) lines.push({ kind: "proficiency", text });
  }

  if (lines.length === 0) {
    const rawParts = [
      ...effect.modifiers,
      ...effect.damage_adjustments,
      ...effect.statuses,
      ...effect.condition_adjustments,
      ...effect.proficiencies,
    ]
      .flatMap((entry) => {
        const formatted = formatRecordFallback(entry);
        return formatted ? [formatted] : [];
      });

    if (rawParts.length > 0) {
      for (const text of rawParts) {
        lines.push({ kind: "raw", text });
      }
    }
  }

  return lines;
}

export function formatActiveEffects(
  effects: CharacterActiveEffect[],
): { effect: CharacterActiveEffect; lines: FormattedEffectLine[] }[] {
  return effects
    .filter((entry) => entry.is_active)
    .map((effect) => ({
      effect,
      lines: formatEffectDetails(effect),
    }));
}
