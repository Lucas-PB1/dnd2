"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";

type CampanhaViewProps = {
  email: string;
};

export function CampanhaView({ email }: CampanhaViewProps) {
  return (
    <section aria-labelledby="campanha-heading">
      <FadeIn>
        <h1
          id="campanha-heading"
          className="font-serif text-3xl font-bold text-foreground"
        >
          Suas campanhas
        </h1>
      </FadeIn>

      <FadeIn delay={0.08}>
        <p className="mt-2 text-muted">
          Bem-vindo, <span className="text-brand-soft">{email}</span>. A mesa
          está pronta — em breve você poderá criar personagens e iniciar
          combates.
        </p>
      </FadeIn>

      <FadeIn delay={0.16} className="mt-10">
        <motion.div
          className="rounded-2xl border border-dashed border-border-strong bg-surface/40 p-8 text-center"
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.2 }}
        >
          <Stagger>
            <StaggerItem>
              <p className="text-lg text-foreground/90">Nenhuma campanha ainda</p>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-2 text-sm text-muted-subtle">
                Quando o módulo de campanhas estiver disponível, você verá suas
                mesas aqui.
              </p>
            </StaggerItem>
            <StaggerItem>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button type="button" disabled className="sm:!w-auto sm:min-w-44">
                  Nova campanha (em breve)
                </Button>
                <Link
                  href="/"
                  className="text-sm text-brand transition-colors hover:text-brand-hover"
                >
                  Voltar ao início
                </Link>
              </div>
            </StaggerItem>
          </Stagger>
        </motion.div>
      </FadeIn>
    </section>
  );
}
