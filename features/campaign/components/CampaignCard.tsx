"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Campaign } from "@/features/campaign/types/campaign.types";

type CampaignCardProps = {
  campaign: Campaign;
  currentUserId: string;
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function CampaignCard({ campaign, currentUserId }: CampaignCardProps) {
  const isOwner = campaign.owner_player_id === currentUserId;
  const memberLabel =
    campaign.member_count === 0
      ? isOwner
        ? "Apenas o dono"
        : "Sem jogadores convidados"
      : campaign.member_count === 1
        ? "1 jogador convidado"
        : `${campaign.member_count} jogadores convidados`;

  return (
    <motion.li whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Link
        href={`/campanha/${campaign.id}`}
        className="block rounded-xl border border-border bg-surface/40 p-5 transition-colors hover:border-border-strong hover:bg-surface/60"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif text-lg font-semibold text-foreground">
            {campaign.name}
          </h2>
          {isOwner ? (
            <span className="shrink-0 rounded-full border border-brand/30 bg-brand-glow/40 px-2.5 py-0.5 text-xs font-medium text-brand-soft">
              Dono
            </span>
          ) : null}
        </div>

        {campaign.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {campaign.description}
          </p>
        ) : null}

        <p className="mt-4 text-xs text-muted-subtle">
          {memberLabel} · Atualizada em {formatDate(campaign.updated_at)}
        </p>
      </Link>
    </motion.li>
  );
}
