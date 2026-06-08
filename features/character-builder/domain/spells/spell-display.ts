import type { BuilderSpellOption } from "@/features/character-builder/types/builder.types";
import type { SelectionFact } from "@/features/character-builder/components/shared/BuilderParts";

export function spellLevelSchoolLabel(spell: BuilderSpellOption): string {
  const level = spell.level === 0 ? "Truque" : `Lv${spell.level}`;
  return spell.school ? `${level} / ${spell.school}` : level;
}

export function spellSelectionFacts(spell: BuilderSpellOption): SelectionFact[] {
  const facts: SelectionFact[] = [{ label: "", value: spellLevelSchoolLabel(spell) }];

  if (spell.requires_concentration) {
    facts.push({ label: "", value: "Conc." });
  }

  if (spell.requires_ritual) {
    facts.push({ label: "", value: "Ritual" });
  }

  return facts;
}

export function spellEffectText(spell: BuilderSpellOption): string | null {
  if (spell.character_effect_summary?.trim()) {
    return spell.character_effect_summary.trim();
  }

  const description = spell.description?.trim();
  if (!description) return null;

  const effectMatch = description.match(
    /Character effect:\s*[^.]+\.\s*([\s\S]+)$/i,
  );
  if (effectMatch?.[1]) {
    return effectMatch[1].trim();
  }

  const mechanical = spellMechanicalFallback(spell);
  if (mechanical) return mechanical;

  if (description.startsWith("D&D 2024 spell catalog entry.")) {
    return null;
  }

  return description;
}

function spellMechanicalFallback(spell: BuilderSpellOption): string | null {
  const parts: string[] = [];

  if (spell.attack_type) {
    parts.push(`Ataque: ${spell.attack_type}.`);
  }

  if (spell.save_attribute) {
    parts.push(`Salvaguarda: ${spell.save_attribute}.`);
  }

  return parts.length > 0 ? parts.join(" ") : null;
}

type SpellMetadataField =
  | "casting_time"
  | "range_text"
  | "components"
  | "material_component"
  | "duration_text"
  | "save_attribute"
  | "attack_type";

const METADATA_PATTERNS: Record<SpellMetadataField, RegExp> = {
  casting_time: /Casting:\s*([^.]+(?:\.[^A-Z])?[^.]*)/i,
  range_text: /Range:\s*([^.]+)/i,
  components: /Components:\s*([^.]+)/i,
  material_component: /Material:\s*([^.]+)/i,
  duration_text: /Duration:\s*([^.]+)/i,
  save_attribute: /Primary save:\s*([^.]+)/i,
  attack_type: /Attack type:\s*([^.]+)/i,
};

function metadataFromDescription(
  description: string | null | undefined,
): Partial<Record<SpellMetadataField, string>> {
  if (!description) return {};

  const parsed: Partial<Record<SpellMetadataField, string>> = {};
  for (const [field, pattern] of Object.entries(METADATA_PATTERNS) as [
    SpellMetadataField,
    RegExp,
  ][]) {
    const match = description.match(pattern);
    if (match?.[1]) {
      parsed[field] = match[1].trim();
    }
  }

  return parsed;
}

export function spellMetadataValue(
  spell: BuilderSpellOption,
  field: SpellMetadataField,
): string | null {
  const direct = spell[field];
  if (typeof direct === "string" && direct.trim()) {
    return direct.trim();
  }

  return metadataFromDescription(spell.description)[field] ?? null;
}

export const SPELL_METADATA_FIELDS: {
  field: SpellMetadataField;
  label: string;
}[] = [
  { field: "casting_time", label: "Lançamento" },
  { field: "range_text", label: "Alcance" },
  { field: "components", label: "Componentes" },
  { field: "duration_text", label: "Duração" },
  { field: "save_attribute", label: "Salvaguarda" },
  { field: "attack_type", label: "Ataque" },
  { field: "material_component", label: "Material" },
];
