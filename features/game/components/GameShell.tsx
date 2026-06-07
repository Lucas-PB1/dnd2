"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { LogoutButton } from "@/features/auth";
import { PageEnter, headerEnter } from "@/components/motion";

type GameShellProps = {
  email: string | null;
  children: ReactNode;
};

const NAV_ITEMS = [
  { href: "/campanha", label: "Campanhas" },
  { href: "/ficha", label: "Fichas" },
] as const;

function navIsActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function GameShell({ email, children }: GameShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-svh flex-1 flex-col">
      <motion.header
        className="border-b border-border bg-background/80 backdrop-blur-sm"
        initial="hidden"
        animate="visible"
        variants={headerEnter}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/campanha"
              className="font-serif text-lg font-semibold text-brand-soft transition-colors hover:text-brand"
            >
              D&amp;D 2024
            </Link>
            <nav aria-label="Principal" className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = navIsActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? "bg-brand-glow/50 text-brand-soft"
                        : "text-muted hover:bg-surface/60 hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <nav aria-label="Conta" className="flex items-center gap-4">
            {email ? (
              <span className="hidden text-sm text-muted sm:inline">{email}</span>
            ) : null}
            <LogoutButton />
          </nav>
        </div>
      </motion.header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <PageEnter>{children}</PageEnter>
      </main>
    </div>
  );
}
