"use client";

import {
  ABILITY_LABELS,
} from "@/features/character-builder/components/shared/BuilderParts";
import {
  ABILITY_KEYS,
  type CharacterBuilderData,
  type CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";
import {
  classRequiresExpertiseSelection,
  classRequiresSpellSelection,
  computePreviewAbilities,
  getExpertiseSelectionsForTrait,
  totalExpertiseChoicesRequired,
} from "@/features/character-builder/hooks/useCharacterBuilder";
import { totalFeatSpellChoicesRequired } from "@/features/character-builder/domain/spells/feat-spells";
import { abilityModifier } from "@/features/character-builder/domain/abilities/abilities";

type BuilderPreviewPanelProps = {
  data: CharacterBuilderData | null;
  state: CharacterBuilderState;
};

function formatModifier(score: number): string {
  const mod = abilityModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function PreviewRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="truncate text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function BuilderPreviewPanel({ data, state }: BuilderPreviewPanelProps) {
  const species = data?.species.find((s) => s.id === state.species_id);
  const background = data?.backgrounds.find((b) => b.id === state.background_id);
  const cls = data?.classes.find((c) => c.id === state.class_id);
  const abilities = data ? computePreviewAbilities(data, state) : null;

  const maxSkills =
    cls?.skill_choices.reduce((sum, g) => sum + g.choice_count, 0) ?? 0;
  const spellcasting = cls?.spellcasting ?? null;
  const humanFeat = data?.origin_feats.find(
    (entry) => entry.id === state.human_origin_feat_id,
  );
  const featSpellRequired =
    totalFeatSpellChoicesRequired(background?.origin_feat_spellcasting) +
    totalFeatSpellChoicesRequired(humanFeat?.spellcasting);
  const showFeatSpells = featSpellRequired > 0;
  const showSpells =
    classRequiresSpellSelection(spellcasting) || showFeatSpells;
  const expertiseGroups = cls?.expertise_choices ?? [];
  const showExpertise = classRequiresExpertiseSelection(expertiseGroups);
  const expertiseRequired = totalExpertiseChoicesRequired(expertiseGroups);
  const expertiseSelected = expertiseGroups.reduce(
    (sum, group) =>
      sum + getExpertiseSelectionsForTrait(state, group.trait_id).length,
    0,
  );

  return (
    <aside
      aria-label="Prévia do personagem"
      className="editorial-card flex h-full min-w-0 flex-col overflow-hidden rounded-lg"
    >
      <header className="shrink-0 border-b border-border px-4 py-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted">
          Prévia
        </p>
        <p className="mt-1 truncate font-serif text-xl font-semibold text-foreground">
          {state.name.trim() || "Sem nome"}
        </p>
      </header>

      <div className="scrollbar-subtle flex-1 space-y-4 overflow-y-auto px-4 py-3">
        <dl className="space-y-2">
          <PreviewRow label="Espécie" value={species?.name ?? null} />
          {state.size ? (
            <PreviewRow label="Tamanho" value={state.size} />
          ) : null}
          <PreviewRow label="Antecedente" value={background?.name ?? null} />
          <PreviewRow label="Classe" value={cls?.name ?? null} />
          {background?.origin_feat_name ? (
            <PreviewRow
              label="Feat de origem"
              value={background.origin_feat_name}
            />
          ) : null}
          {maxSkills > 0 ? (
            <PreviewRow
              label="Perícias"
              value={`${state.class_skill_ids.length}/${maxSkills}`}
            />
          ) : null}
          {showExpertise ? (
            <PreviewRow
              label="Expertise"
              value={`${expertiseSelected}/${expertiseRequired}`}
            />
          ) : null}
          {showSpells && spellcasting ? (
            <>
              {spellcasting.cantrip_count > 0 ? (
                <PreviewRow
                  label="Truques"
                  value={`${state.cantrip_spell_ids.length}/${spellcasting.cantrip_count}`}
                />
              ) : null}
              {spellcasting.spellbook_count > 0 ? (
                <PreviewRow
                  label="Grimório"
                  value={`${state.spellbook_spell_ids.length}/${spellcasting.spellbook_count}`}
                />
              ) : null}
              {spellcasting.prepared_count > 0 ? (
                <PreviewRow
                  label="Preparadas"
                  value={`${state.prepared_spell_ids.length}/${spellcasting.prepared_count}`}
                />
              ) : null}
            </>
          ) : null}
          {showFeatSpells ? (
            <PreviewRow
              label="Magias de talento"
              value={`${state.feat_spell_selections.length}/${featSpellRequired}`}
            />
          ) : null}
        </dl>

        {abilities ? (
          <section>
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-muted">
              Atributos
            </p>
            <div className="grid grid-cols-3 gap-2">
              {ABILITY_KEYS.map((key) => (
                <div
                  key={key}
                  title={ABILITY_LABELS[key]}
                  className="min-w-0 rounded-lg border border-accent/25 bg-accent-muted/15 px-2 py-2 text-center shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]"
                >
                  <p className="truncate text-xs font-medium uppercase text-muted-subtle">
                    {key}
                  </p>
                  <p className="text-base font-semibold tabular-nums text-foreground">
                    {abilities[key]}
                  </p>
                  <p className="text-xs text-accent-soft">
                    {formatModifier(abilities[key])}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </aside>
  );
}
