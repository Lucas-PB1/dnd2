import { abilityModifier } from "@/features/character-builder/domain/abilities/abilities";

export function formatModifier(score: number): string {
  const mod = abilityModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
