"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/motion";
import { createCampaign } from "@/features/campaign/services/campaign.service";
import {
  CAMPAIGN_NAME_MIN,
  type Campaign,
} from "@/features/campaign/types/campaign.types";

type CreateCampaignFormProps = {
  onCreated?: (campaign: Campaign) => void;
};

export function CreateCampaignForm({ onCreated }: CreateCampaignFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setDescription("");
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (trimmedName.length < CAMPAIGN_NAME_MIN) {
      setError(`Informe um nome com pelo menos ${CAMPAIGN_NAME_MIN} caracteres.`);
      return;
    }

    setLoading(true);

    try {
      const campaign = await createCampaign({
        name: trimmedName,
        description: description.trim() || undefined,
      });
      reset();
      setOpen(false);
      onCreated?.(campaign);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível criar a campanha.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button
        type="button"
        className="sm:w-auto! sm:min-w-44"
        onClick={() => setOpen(true)}
      >
        Nova campanha
      </Button>
    );
  }

  return (
    <FadeIn className="rounded-2xl border border-border bg-surface/50 p-6">
      <h2 className="font-serif text-xl font-semibold text-foreground">
        Nova campanha
      </h2>
      <p className="mt-1 text-sm text-muted">
        Crie uma mesa para reunir jogadores e personagens.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        {error ? (
          <p className="rounded-lg border border-danger/30 bg-danger-surface px-4 py-3 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div>
          <Label htmlFor="campaign-name">Nome da campanha</Label>
          <Input
            id="campaign-name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="As Crônicas de Faerûn"
            required
            maxLength={255}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="campaign-description">Descrição (opcional)</Label>
          <textarea
            id="campaign-description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Sinopse, tom da mesa, regras da casa…"
            className="mt-1.5 min-h-24 w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-foreground placeholder:text-muted-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" loading={loading} className="w-auto!">
            Criar campanha
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-auto!"
            disabled={loading}
            onClick={() => {
              reset();
              setOpen(false);
            }}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </FadeIn>
  );
}
