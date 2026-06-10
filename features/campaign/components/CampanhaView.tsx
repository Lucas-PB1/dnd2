"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { Surface } from "@/components/ui/Surface";
import type { Campaign } from "@/shared/campaign";
import { CampaignCard } from "@/features/campaign/components/CampaignCard";
import { CreateCampaignForm } from "@/features/campaign/components/CreateCampaignForm";

type CampanhaViewProps = {
  email: string;
  userId: string;
  initialCampaigns: Campaign[];
};

export function CampanhaView({
  email,
  userId,
  initialCampaigns,
}: CampanhaViewProps) {
  const hasCampaigns = initialCampaigns.length > 0;

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
          Bem-vindo, <span className="text-brand-soft">{email}</span>. Gerencie
          suas mesas e convide jogadores quando estiver pronto.
        </p>
      </FadeIn>

      <FadeIn delay={0.14} className="mt-8">
        <CreateCampaignForm />
      </FadeIn>

      {hasCampaigns ? (
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2">
          {initialCampaigns.map((campaign) => (
            <StaggerItem key={campaign.id}>
              <CampaignCard campaign={campaign} currentUserId={userId} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <FadeIn delay={0.2} className="mt-10">
          <Surface tone="dashed" className="p-8 text-center">
            <span className="mx-auto flex size-11 items-center justify-center rounded-lg border border-accent/25 bg-accent-muted/20 text-accent-soft">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <p className="mt-4 text-lg text-foreground/90">
              Nenhuma campanha ainda
            </p>
            <p className="mt-2 text-sm text-muted-subtle">
              Crie sua primeira mesa para começar a organizar personagens e
              sessões.
            </p>
            <Link
              href="/"
              transitionTypes={["nav-back"]}
              className="mt-6 inline-block text-sm text-brand transition-colors hover:text-brand-hover"
            >
              Voltar ao início
            </Link>
          </Surface>
        </FadeIn>
      )}
    </section>
  );
}
