"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import {
  FadeIn,
  PageBackdrop,
  Stagger,
  StaggerItem,
} from "@/components/motion";

const FEATURES = [
  {
    title: "Google",
    text: "Login com um clique — sem senha para lembrar.",
    icon: Sparkles,
  },
  {
    title: "Sessão segura",
    text: "Cookies httpOnly — chaves nunca no browser.",
    icon: ShieldCheck,
  },
] as const;

export function LandingPage() {
  return (
    <PageBackdrop className="min-h-svh">
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6 sm:px-6">
        <FadeIn>
          <span className="font-serif text-xl font-semibold text-brand-soft">
            D&amp;D 2024
          </span>
        </FadeIn>
        <nav aria-label="Principal">
          <FadeIn delay={0.06}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/entrar"
                transitionTypes={["nav-forward"]}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-brand/70 bg-brand px-5 text-sm font-medium text-on-brand shadow-[0_10px_28px_rgb(199_161_90/0.18),inset_0_1px_0_rgb(255_255_255/0.22)] transition-[background-color,border-color,transform] hover:-translate-y-0.5 hover:border-brand-hover hover:bg-brand-hover active:translate-y-0"
              >
                Entrar com Google
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </motion.div>
          </FadeIn>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 pb-16 pt-8 sm:px-6">
        <FadeIn delay={0.08}>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand/80">
            SRD · Mesa digital
          </p>
        </FadeIn>

        <FadeIn delay={0.14}>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Role o d20. O banco guarda o resto.
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Fichas de personagem, combate e campanhas para Dungeons &amp; Dragons
            2024 — entre com sua conta Google.
          </p>
        </FadeIn>

        <FadeIn delay={0.26} className="mt-10">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/entrar"
              transitionTypes={["nav-forward"]}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-brand/70 bg-brand px-6 font-medium text-on-brand shadow-[0_10px_28px_rgb(199_161_90/0.18),inset_0_1px_0_rgb(255_255_255/0.22)] transition-[background-color,border-color,transform] hover:-translate-y-0.5 hover:border-brand-hover hover:bg-brand-hover active:translate-y-0"
            >
              Começar aventura
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </motion.div>
        </FadeIn>

        <Stagger className="mt-16 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
            <StaggerItem key={item.title}>
              <motion.article
                className="editorial-card rounded-lg p-5"
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg border border-accent/25 bg-accent-muted/20 text-accent-soft">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <h2 className="font-medium text-brand-soft">{item.title}</h2>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-subtle">
                  {item.text}
                </p>
              </motion.article>
            </StaggerItem>
            );
          })}
        </Stagger>
      </main>
    </PageBackdrop>
  );
}
