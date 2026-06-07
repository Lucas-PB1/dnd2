"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/motion";
import {
  fetchCampaignMembers,
  inviteCampaignMember,
  removeCampaignMember,
} from "@/features/campaign/services/campaign.service";
import {
  INVITEABLE_ROLES,
  INVITE_ROLE_LABELS,
  DEFAULT_INVITE_ROLE,
  type CampaignInviteRole,
  type CampaignMember,
} from "@/features/campaign/types/campaign.types";

type CampaignMembersPanelProps = {
  campaignId: number;
  isOwner: boolean;
  currentUserId: string;
};

function memberLabel(member: CampaignMember): string {
  return member.display_name ?? member.username ?? member.email ?? "Jogador";
}

function roleLabel(roleName: string | null, isOwner: boolean): string {
  if (isOwner) return "Dono";
  if (!roleName) return "Membro";
  if (roleName in INVITE_ROLE_LABELS) {
    return INVITE_ROLE_LABELS[roleName as CampaignInviteRole];
  }
  return roleName;
}

function MemberRow({
  member,
  isOwner,
  currentUserId,
  onRemove,
  removing,
}: {
  member: CampaignMember;
  isOwner: boolean;
  currentUserId: string;
  onRemove: (playerId: string) => void;
  removing: string | null;
}) {
  const isSelf = member.player_id === currentUserId;
  const canRemove =
    !member.is_owner && (isOwner || isSelf);
  const removeLabel = isSelf ? "Sair da mesa" : "Remover";

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/30 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">
          {memberLabel(member)}
        </p>
        {member.email ? (
          <p className="truncate text-sm text-muted">{member.email}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded-full border border-border-strong bg-surface/60 px-2.5 py-0.5 text-xs text-brand-soft">
          {roleLabel(member.role_name, member.is_owner)}
        </span>
        {canRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="md"
            className="!w-auto min-w-0 px-2 text-danger hover:bg-danger-surface/40 hover:text-danger"
            loading={removing === member.player_id}
            onClick={() => onRemove(member.player_id)}
          >
            {removeLabel}
          </Button>
        ) : null}
      </div>
    </li>
  );
}

export function CampaignMembersPanel({
  campaignId,
  isOwner,
  currentUserId,
}: CampaignMembersPanelProps) {
  const [members, setMembers] = useState<CampaignMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CampaignInviteRole>(DEFAULT_INVITE_ROLE);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    setLoadError(null);
    setLoading(true);

    try {
      const list = await fetchCampaignMembers(campaignId);
      setMembers(list);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Não foi possível carregar os membros.",
      );
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const handleInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInviteError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setInviteError("Informe o e-mail do jogador.");
      return;
    }

    setInviting(true);

    try {
      await inviteCampaignMember(campaignId, {
        email: trimmedEmail,
        role,
      });
      setEmail("");
      setRole(DEFAULT_INVITE_ROLE);
      await loadMembers();
    } catch (err) {
      setInviteError(
        err instanceof Error ? err.message : "Não foi possível convidar o jogador.",
      );
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (playerId: string) => {
    setRemoving(playerId);

    try {
      await removeCampaignMember(campaignId, playerId);
      await loadMembers();
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Não foi possível remover o jogador.",
      );
    } finally {
      setRemoving(null);
    }
  };

  const invitedCount = Math.max(members.length - 1, 0);

  return (
    <FadeIn delay={0.18} className="mt-10">
      <div className="rounded-2xl border border-border bg-surface/40 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-medium text-brand-soft">Jogadores na mesa</h2>
          <p className="text-xs text-muted-subtle">
            {members.length}{" "}
            {members.length === 1 ? "pessoa" : "pessoas"}
            {invitedCount > 0
              ? ` · ${invitedCount} convidado${invitedCount === 1 ? "" : "s"}`
              : ""}
          </p>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-muted">Carregando membros…</p>
        ) : loadError ? (
          <p className="mt-4 rounded-lg border border-danger/30 bg-danger-surface px-4 py-3 text-sm text-danger" role="alert">
            {loadError}
          </p>
        ) : (
          <ul className="mt-4 space-y-2" aria-label="Membros da campanha">
            {members.map((member) => (
              <MemberRow
                key={member.player_id}
                member={member}
                isOwner={isOwner}
                currentUserId={currentUserId}
                onRemove={handleRemove}
                removing={removing}
              />
            ))}
          </ul>
        )}

        {isOwner ? (
          <form onSubmit={handleInvite} className="mt-6 space-y-4 border-t border-border pt-6" noValidate>
            <h3 className="text-sm font-medium text-foreground">Convidar jogador</h3>
            <p className="text-sm text-muted">
              A pessoa precisa já ter entrado no app com Google. Informe o e-mail
              da conta dela.
            </p>

            {inviteError ? (
              <p className="rounded-lg border border-danger/30 bg-danger-surface px-4 py-3 text-sm text-danger" role="alert">
                {inviteError}
              </p>
            ) : null}

            <div>
              <Label htmlFor="invite-email">E-mail</Label>
              <Input
                id="invite-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jogador@exemplo.com"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="invite-role">Papel na mesa</Label>
              <select
                id="invite-role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value as CampaignInviteRole)}
                className="mt-1.5 min-h-11 w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {INVITEABLE_ROLES.map((option) => (
                  <option key={option} value={option}>
                    {INVITE_ROLE_LABELS[option]}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" loading={inviting} className="sm:!w-auto">
              Convidar
            </Button>
          </form>
        ) : null}
      </div>
    </FadeIn>
  );
}
