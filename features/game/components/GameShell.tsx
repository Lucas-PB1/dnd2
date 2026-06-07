"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { LogoutButton } from "@/features/auth";
import { PageEnter, headerEnter } from "@/components/motion";

type GameShellProps = {
  email: string | null;
  children: ReactNode;
};

export function GameShell({ email, children }: GameShellProps) {
  return (
    <div className="flex min-h-svh flex-1 flex-col">
      <motion.header
        className="border-b border-border bg-background/80 backdrop-blur-sm"
        initial="hidden"
        animate="visible"
        variants={headerEnter}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/campanha"
            className="font-serif text-lg font-semibold text-brand-soft transition-colors hover:text-brand"
          >
            D&amp;D 2024
          </Link>
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
