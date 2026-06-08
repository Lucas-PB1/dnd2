import type { createAdminClient } from "@/lib/supabase/admin";
import { clampClassLevel } from "@/features/character-builder/domain/progression/levels";

export type BuilderAdminClient = ReturnType<typeof createAdminClient>;

export type ClassSpellcastingRow = {
  class_id: number;
  spellcasting_ability: string | null;
  cantrip_progression: string | null;
  prepared_progression_slug: string | null;
  uses_spellbook: boolean;
};

export type BuilderDetailsRequest = {
  class_id: number;
  species_id: number;
  background_id: number;
  class_level: number;
  subclass_id?: number | null;
};

export function normalizeBuilderClassLevel(level: unknown): number {
  return clampClassLevel(Number(level) || 1);
}
