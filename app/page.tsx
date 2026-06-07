import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (claimsData?.claims) {
    redirect("/campanha");
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,--tw-gradient-stops)] from-amber-950/25 via-stone-950 to-stone-950"
        aria-hidden
      />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6 sm:px-6">
        <span className="font-serif text-xl font-semibold text-amber-100">
          D&amp;D 2024
        </span>
        <nav aria-label="Principal">
          <Link
            href="/entrar"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-amber-600 px-5 text-sm font-medium text-stone-950 transition-colors hover:bg-amber-500"
          >
            Entrar com Google
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 pb-16 pt-8 sm:px-6">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-amber-500/80">
          SRD · Mesa digital
        </p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl font-bold leading-tight text-amber-50 sm:text-5xl">
          Role o d20. O banco guarda o resto.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-400">
          Fichas de personagem, combate e campanhas para Dungeons &amp; Dragons
          2024 — entre com sua conta Google.
        </p>

        <div className="mt-10">
          <Link
            href="/entrar"
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-amber-600 px-6 font-medium text-stone-950 transition-colors hover:bg-amber-500"
          >
            Começar aventura
          </Link>
        </div>

        <ul className="mt-16 grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Google",
              text: "Login com um clique — sem senha para lembrar.",
            },
            {
              title: "Sessão segura",
              text: "Cookies httpOnly — chaves nunca no browser.",
            },
          ].map((item) => (
            <li
              key={item.title}
              className="rounded-xl border border-amber-900/20 bg-stone-900/40 p-5"
            >
              <h2 className="font-medium text-amber-100">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                {item.text}
              </p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
