"use client";

import Link from "next/link";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import type { Campaign } from "@/features/campaign/types/campaign.types";
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
          <div className="rounded-2xl border border-dashed border-border-strong bg-surface/40 p-8 text-center">
            <p className="text-lg text-foreground/90">Nenhuma campanha ainda</p>
            <p className="mt-2 text-sm text-muted-subtle">
              Crie sua primeira mesa para começar a organizar personagens e
              sessões.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block text-sm text-brand transition-colors hover:text-brand-hover"
            >
              Voltar ao início
            </Link>
          </div>
        </FadeIn>
      )}
    </section>
  );
}
