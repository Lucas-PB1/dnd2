import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listCharactersForUser } from "@/lib/character/server";
import { CharacterListView } from "@/features/character-sheet";

export const metadata: Metadata = {
  title: "Fichas",
  description: "Seus personagens de D&D 2024",
};

export default async function FichaPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    redirect("/entrar?next=/ficha");
  }

  let characters: Awaited<ReturnType<typeof listCharactersForUser>> = [];

  try {
    characters = await listCharactersForUser(claimsData.claims.sub);
  } catch {
    characters = [];
  }

  return <CharacterListView initialCharacters={characters} />;
}
