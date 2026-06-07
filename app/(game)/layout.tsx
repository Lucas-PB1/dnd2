import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/features/auth";

export default async function CampanhaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const email =
    typeof claimsData?.claims?.email === "string"
      ? claimsData.claims.email
      : null;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-amber-900/20 bg-stone-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/campanha"
            className="font-serif text-lg font-semibold text-amber-100"
          >
            D&amp;D 2024
          </Link>
          <nav aria-label="Conta" className="flex items-center gap-4">
            {email ? (
              <span className="hidden text-sm text-stone-400 sm:inline">
                {email}
              </span>
            ) : null}
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
