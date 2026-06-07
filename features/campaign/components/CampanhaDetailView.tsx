"use client";

import Link from "next/link";
import { FadeIn } from "@/components/motion";
import { CampaignMembersPanel } from "@/features/campaign/components/CampaignMembersPanel";
import type { CampaignDetail } from "@/features/campaign/types/campaign.types";

type CampanhaDetailViewProps = {
  campaign: CampaignDetail;
  currentUserId: string;
};

export function CampanhaDetailView({
  campaign,
  currentUserId,
}: CampanhaDetailViewProps) {
  return (
    <article aria-labelledby="campaign-detail-heading">
      <FadeIn>
        <Link
          href="/campanha"
          className="text-sm text-brand transition-colors hover:text-brand-hover"
        >
          ← Voltar às campanhas
        </Link>
      </FadeIn>

      <FadeIn delay={0.06} className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1
            id="campaign-detail-heading"
            className="font-serif text-3xl font-bold text-foreground"
          >
            {campaign.name}
          </h1>
          {campaign.is_owner ? (
            <span className="rounded-full border border-brand/30 bg-brand-glow/40 px-3 py-1 text-xs font-medium text-brand-soft">
              Você é o dono
            </span>
          ) : null}
        </div>
      </FadeIn>

      {campaign.description ? (
        <FadeIn delay={0.12}>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">
            {campaign.description}
          </p>
        </FadeIn>
      ) : null}

      <CampaignMembersPanel
        campaignId={campaign.id}
        isOwner={campaign.is_owner}
        currentUserId={currentUserId}
      />

      <FadeIn delay={0.24} className="mt-6">
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface/20 p-6">
          <h2 className="text-sm font-medium text-muted">Em breve</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted-subtle">
            <li>Vincular fichas de personagem à campanha</li>
            <li>Iniciar combates e sessões</li>
          </ul>
        </div>
      </FadeIn>
    </article>
  );
}
