import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CharacterBuilderWizard } from "@/features/character-builder";

export const metadata: Metadata = {
  title: "Novo personagem",
  description: "Criar personagem de D&D 2024",
};

export default async function FichaNovoPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    redirect("/entrar?next=/ficha/novo");
  }

  return <CharacterBuilderWizard />;
}
