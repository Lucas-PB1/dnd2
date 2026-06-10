"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FadeIn } from "@/components/motion";
import { Badge } from "@/components/ui/Badge";
import { Surface } from "@/components/ui/Surface";
import { CharacterSpellSlotsSection } from "@/features/character-sheet/components/sheet/CharacterSpellSlotsSection";
import { CharacterLevelUpSection } from "@/features/character-sheet/components/sheet/CharacterLevelUpSection";
import { CharacterResourcesSection } from "@/features/character-sheet/components/sheet/CharacterResourcesSection";
import { CharacterTraitsSection } from "@/features/character-sheet/components/sheet/CharacterTraitsSection";
import { CharacterVitalsSection } from "@/features/character-sheet/components/sheet/CharacterVitalsSection";
import { CharacterAbilitiesSection } from "@/features/character-sheet/components/sheet/CharacterAbilitiesSection";
import { CharacterCombatSection } from "@/features/character-sheet/components/sheet/CharacterCombatSection";
import { CharacterSpellsSection } from "@/features/character-sheet/components/sheet/CharacterSpellsSection";
import { CharacterProficienciesSection } from "@/features/character-sheet/components/sheet/CharacterProficienciesSection";
import { CharacterInventorySection } from "@/features/character-sheet/components/sheet/CharacterInventorySection";
import { CharacterEffectsSection } from "@/features/character-sheet/components/sheet/CharacterEffectsSection";
import { CharacterFeatsSection } from "@/features/character-sheet/components/sheet/CharacterFeatsSection";
import { CharacterTraitOptionsSection } from "@/features/character-sheet/components/sheet/CharacterTraitOptionsSection";
import { formatProficiencyBonus } from "@/features/character-sheet/domain/sheet-display";
import type { CharacterDetail } from "@/shared/character";

type CharacterSheetViewProps = {
  character: CharacterDetail;
};

function formatClasses(character: CharacterDetail): string {
  if (!character.classes.length) return "—";
  return character.classes
    .map((entry) => `${entry.name} ${entry.level}`)
    .join(", ");
}

function formatFeatsSummary(character: CharacterDetail): string | null {
  if (character.character_feats.length > 0) {
    return character.character_feats.map((feat) => feat.name).join(", ");
  }
  return character.sheet_summary?.feats ?? null;
}

function multiclassSpellNote(character: CharacterDetail): string | null {
  if (character.spellcasting_entries.length <= 1) return null;
  const names = character.spellcasting_entries
    .map((entry) => `${entry.class_name} ${entry.class_level}`)
    .join(", ");
  return `Multiclasse: slots combinados (${names}).`;
}

export function CharacterSheetView({ character }: CharacterSheetViewProps) {
  const summary = character.sheet_summary;
  const featsSummary = formatFeatsSummary(character);

  return (
    <article aria-labelledby="character-detail-heading">
      <FadeIn>
        <Link
          href="/ficha"
          transitionTypes={["nav-back"]}
          className="inline-flex items-center gap-1.5 text-sm text-brand transition-colors hover:text-brand-hover"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar às fichas
        </Link>
      </FadeIn>

      <FadeIn delay={0.06} className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1
            id="character-detail-heading"
            className="font-serif text-3xl font-bold text-foreground"
          >
            {character.name}
          </h1>
          <Badge tone="accent">
            Nível {character.level}
          </Badge>
          <Badge tone="neutral">
            Prof {formatProficiencyBonus(character.proficiency_bonus)}
          </Badge>
        </div>
      </FadeIn>

      <FadeIn delay={0.12} className="mt-6">
        <Surface className="p-6">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-subtle">Espécie</dt>
              <dd className="mt-1 text-foreground">
                {character.species_name ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-subtle">Antecedente</dt>
              <dd className="mt-1 text-foreground">
                {character.background_name ?? "—"}
              </dd>
            </div>
            <div className="lg:col-span-2">
              <dt className="text-xs text-muted-subtle">Classes</dt>
              <dd className="mt-1 text-foreground">{formatClasses(character)}</dd>
            </div>
            {summary?.size ? (
              <div>
                <dt className="text-xs text-muted-subtle">Tamanho</dt>
                <dd className="mt-1 text-foreground">{summary.size}</dd>
              </div>
            ) : null}
            {featsSummary ? (
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-subtle">Feats</dt>
                <dd className="mt-1 text-foreground">{featsSummary}</dd>
              </div>
            ) : null}
            {character.starting_gold_gp > 0 ? (
              <div>
                <dt className="text-xs text-muted-subtle">Ouro inicial</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {character.starting_gold_gp.toLocaleString("pt-BR")} PO
                </dd>
              </div>
            ) : null}
          </dl>
        </Surface>
      </FadeIn>

      <FadeIn delay={0.15} className="mt-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.42fr)]">
          <div className="space-y-6">
            <CharacterAbilitiesSection character={character} />
            <CharacterCombatSection character={character} />
            <CharacterSpellsSection character={character} />
            <CharacterInventorySection inventory={character.inventory} />
            <CharacterTraitsSection
              characterId={character.id}
              traits={character.traits}
            />
          </div>

          <aside className="space-y-6">
            <CharacterVitalsSection character={character} />

            {character.spellcasting && character.spell_slots.length > 0 ? (
              <CharacterSpellSlotsSection
                spellcasting={character.spellcasting}
                slots={character.spell_slots}
                multiclassNote={multiclassSpellNote(character)}
              />
            ) : null}

            {character.resources.length > 0 ? (
              <CharacterResourcesSection resources={character.resources} />
            ) : null}

            <CharacterProficienciesSection character={character} />
            <CharacterTraitOptionsSection options={character.trait_options} />
            <CharacterEffectsSection
              effects={character.active_effects}
              modifiers={character.stat_modifiers}
            />
            <CharacterFeatsSection
              characterId={character.id}
              feats={character.character_feats}
            />

            {character.is_owner ? (
              <CharacterLevelUpSection character={character} />
            ) : null}
          </aside>
        </div>
      </FadeIn>
    </article>
  );
}
