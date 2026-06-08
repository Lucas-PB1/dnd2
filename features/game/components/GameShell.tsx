"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ViewTransition, type ReactNode } from "react";
import { BookOpen, ScrollText } from "lucide-react";
import { LogoutButton } from "@/features/auth";
import { PageEnter, headerEnter } from "@/components/motion";

type GameShellProps = {
  email: string | null;
  children: ReactNode;
};

const NAV_ITEMS = [
  { href: "/campanha", label: "Campanhas", icon: ScrollText },
  { href: "/ficha", label: "Fichas", icon: BookOpen },
] as const;

function navIsActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function GameShell({ email, children }: GameShellProps) {
  const pathname = usePathname();
  const isCharacterBuilder = pathname.startsWith("/ficha/novo");

  return (
    <div
      className={`flex flex-1 flex-col ${
        isCharacterBuilder ? "h-svh overflow-hidden" : "min-h-svh"
      }`}
    >
      <motion.header
        className="shrink-0 border-b border-border bg-background/78 shadow-[0_1px_0_rgb(255_255_255/0.03)] backdrop-blur-xl"
        style={{ viewTransitionName: "site-header" }}
        initial="hidden"
        animate="visible"
        variants={headerEnter}
      >
        <div
          className={`mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 ${
            isCharacterBuilder
              ? "max-w-7xl 2xl:max-w-384"
              : "max-w-5xl"
          }`}
        >
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/campanha"
              transitionTypes={["nav-back"]}
              className="font-serif text-lg font-semibold text-brand-soft transition-colors hover:text-brand-hover"
            >
              D&amp;D 2024
            </Link>
            <nav aria-label="Principal" className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = navIsActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    transitionTypes={["nav-forward"]}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-[background-color,border-color,color,box-shadow] ${
                      active
                        ? "border-brand/25 bg-brand-glow/55 text-brand-soft shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]"
                        : "border-transparent text-muted hover:border-border hover:bg-surface/65 hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <nav aria-label="Conta" className="flex items-center gap-4">
            {email ? (
              <span className="hidden max-w-56 truncate rounded-full border border-border bg-surface/40 px-3 py-1 text-xs text-muted sm:inline">
                {email}
              </span>
            ) : null}
            <LogoutButton />
          </nav>
        </div>
      </motion.header>

      <main
        className={`mx-auto w-full flex-1 px-4 sm:px-6 ${
          isCharacterBuilder
            ? "flex min-h-0 max-w-7xl flex-col overflow-hidden py-4 2xl:max-w-384"
            : "max-w-5xl py-8"
        }`}
      >
        <ViewTransition
          enter={{
            "nav-forward": "nav-forward",
            "nav-back": "nav-back",
            default: "none",
          }}
          exit={{
            "nav-forward": "nav-forward",
            "nav-back": "nav-back",
            default: "none",
          }}
          default="none"
        >
          <PageEnter
            className={
              isCharacterBuilder
                ? "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
                : undefined
            }
          >
            {children}
          </PageEnter>
        </ViewTransition>
      </main>
    </div>
  );
}
