import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCharacterForUser } from "@/lib/character/server";
import { CharacterSheetView } from "@/features/character-sheet";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return { title: "Personagem" };
  }

  const character = await getCharacterForUser(Number(id), userId);

  return {
    title: character?.name ?? "Personagem",
    description: character
      ? `${character.name} — nível ${character.level}`
      : "Detalhes do personagem",
  };
}

export default async function FichaDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    redirect("/entrar");
  }

  const { id } = await params;
  const characterId = Number(id);

  if (!Number.isInteger(characterId) || characterId <= 0) {
    notFound();
  }

  const character = await getCharacterForUser(characterId, claimsData.claims.sub);

  if (!character) {
    notFound();
  }

  return (
    <CharacterSheetView
      character={{
        ...character,
        is_owner: true,
      }}
    />
  );
}
