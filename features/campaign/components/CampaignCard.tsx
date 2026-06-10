"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CalendarDays, Crown, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Campaign } from "@/shared/campaign";

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
        transitionTypes={["nav-forward"]}
        className="editorial-card editorial-card-interactive block rounded-lg p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif text-lg font-semibold text-foreground">
            {campaign.name}
          </h2>
          {isOwner ? (
            <Badge tone="brand" className="gap-1">
              <Crown className="size-3" aria-hidden />
              Dono
            </Badge>
          ) : null}
        </div>

        {campaign.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {campaign.description}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-subtle">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" aria-hidden />
            {memberLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" aria-hidden />
            Atualizada em {formatDate(campaign.updated_at)}
          </span>
        </div>
      </Link>
    </motion.li>
  );
}
