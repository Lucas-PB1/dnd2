"use client";

import Link from "next/link";
import { FadeIn } from "@/components/motion";
import type { CampaignDetail } from "@/features/campaign/types/campaign.types";

type CampanhaDetailViewProps = {
  campaign: CampaignDetail;
};

export function CampanhaDetailView({ campaign }: CampanhaDetailViewProps) {
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

      <FadeIn delay={0.18} className="mt-10">
        <div className="rounded-2xl border border-border bg-surface/40 p-6">
          <h2 className="font-medium text-brand-soft">Próximos passos</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Convidar jogadores para a mesa</li>
            <li>Vincular fichas de personagem à campanha</li>
            <li>Iniciar combates e sessões</li>
          </ul>
          <p className="mt-4 text-xs text-muted-subtle">
            {campaign.member_count}{" "}
            {campaign.member_count === 1 ? "membro vinculado" : "membros vinculados"} ·
            em breve: gestão de membros e personagens
          </p>
        </div>
      </FadeIn>
    </article>
  );
}
