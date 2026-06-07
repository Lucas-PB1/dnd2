import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Campanhas",
  description: "Suas campanhas de D&D 2024",
};

export default async function CampanhaPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const email =
    typeof claimsData?.claims?.email === "string"
      ? claimsData.claims.email
      : "aventureiro";

  return (
    <section aria-labelledby="campanha-heading">
      <h1
        id="campanha-heading"
        className="font-serif text-3xl font-bold text-amber-50"
      >
        Suas campanhas
      </h1>
      <p className="mt-2 text-stone-400">
        Bem-vindo, <span className="text-amber-200">{email}</span>. A mesa está
        pronta — em breve você poderá criar personagens e iniciar combates.
      </p>

      <div className="mt-10 rounded-2xl border border-dashed border-amber-800/30 bg-stone-900/40 p-8 text-center">
        <p className="text-lg text-stone-300">Nenhuma campanha ainda</p>
        <p className="mt-2 text-sm text-stone-500">
          Quando o módulo de campanhas estiver disponível, você verá suas mesas
          aqui.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button type="button" disabled className="sm:w-auto! sm:min-w-44">
            Nova campanha (em breve)
          </Button>
          <Link
            href="/"
            className="text-sm text-amber-400 hover:text-amber-300"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </section>
  );
}
