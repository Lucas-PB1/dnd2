import type { BuilderSpellOption } from "@/features/character-builder/types/builder.types";

export function spellChipLabel(spell: BuilderSpellOption): string {
  const tags: string[] = [];
  if (spell.requires_concentration) tags.push("Conc.");
  if (spell.requires_ritual) tags.push("Ritual");
  const suffix = tags.length > 0 ? ` (${tags.join(", ")})` : "";
  return `${spell.name}${suffix}`;
}
