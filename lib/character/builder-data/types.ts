import type { createAdminClient } from "@/lib/supabase/admin";

export type BuilderAdminClient = ReturnType<typeof createAdminClient>;

export const BUILDER_CLASS_LEVEL = 1;

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
};
