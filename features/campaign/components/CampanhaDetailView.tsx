"use client";

import Link from "next/link";
import { ArrowLeft, Crown } from "lucide-react";
import { FadeIn } from "@/components/motion";
import { Badge } from "@/components/ui/Badge";
import { Surface } from "@/components/ui/Surface";
import { CampaignMembersPanel } from "@/features/campaign/components/CampaignMembersPanel";
import type { CampaignDetail } from "@/shared/campaign";

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
          transitionTypes={["nav-back"]}
          className="inline-flex items-center gap-1.5 text-sm text-brand transition-colors hover:text-brand-hover"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar às campanhas
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
            <Badge tone="brand" className="gap-1">
              <Crown className="size-3" aria-hidden />
              Você é o dono
            </Badge>
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
        <Surface tone="dashed" className="p-6">
          <h2 className="text-sm font-medium text-muted">Em breve</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted-subtle">
            <li>Vincular fichas de personagem à campanha</li>
            <li>Iniciar combates e sessões</li>
          </ul>
        </Surface>
      </FadeIn>
    </article>
  );
}
