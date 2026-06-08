import type {
  AbilityKey,
  BuilderBackgroundToolOption,
  BuilderSkillOption,
} from "@/features/character/types/builder.types";

export function parseAbilityOptions(raw: unknown): AbilityKey[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (value): value is AbilityKey =>
      typeof value === "string" &&
      ["STR", "DEX", "CON", "INT", "WIS", "CHA"].includes(value),
  );
}

export function parseSkillProficiencies(raw: unknown): BuilderSkillOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (typeof entry !== "object" || entry === null) return null;
      const row = entry as Record<string, unknown>;
      if (typeof row.skill_id !== "number" || typeof row.name !== "string") {
        return null;
      }
      return {
        skill_id: row.skill_id,
        name: row.name,
        base_attribute:
          typeof row.base_attribute === "string" ? row.base_attribute : "STR",
      };
    })
    .filter((entry): entry is BuilderSkillOption => entry !== null);
}

export function parseBackgroundTools(raw: unknown): BuilderBackgroundToolOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (typeof entry !== "object" || entry === null) return null;
      const row = entry as Record<string, unknown>;
      if (typeof row.id !== "number" || typeof row.name !== "string") {
        return null;
      }
      return {
        id: row.id,
        option_group:
          typeof row.option_group === "string" ? row.option_group : "Tool Proficiency",
        choice_count:
          typeof row.choice_count === "number" ? row.choice_count : 1,
        name: row.name,
        tool_id: typeof row.tool_id === "number" ? row.tool_id : null,
        tool_category:
          typeof row.tool_category === "string" ? row.tool_category : null,
        notes: typeof row.notes === "string" ? row.notes : null,
      };
    })
    .filter((entry): entry is BuilderBackgroundToolOption => entry !== null);
}
