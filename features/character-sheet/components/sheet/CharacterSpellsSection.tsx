"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Surface } from "@/components/ui/Surface";
import { SheetDetailModal } from "@/features/character-sheet/components/sheet/SheetDetailModal";
import {
  abilityLabel,
  formatProficiencyBonus,
  spellLevelLabel,
} from "@/features/character-sheet/domain/sheet-display";
import {
  groupKnownSpells,
  groupTraitSpells,
  preparedSpellSummary,
} from "@/features/character-sheet/domain/sheet-sections/spells-display";
import { useCatalogSnippet } from "@/features/character-sheet/hooks/useCatalogSnippet";
import type {
  CharacterDetail,
  CharacterKnownSpell,
  CharacterTraitSpellChoice,
} from "@/features/character-sheet/types/character.types";

type CharacterSpellsSectionProps = {
  character: CharacterDetail;
};

type SpellModalState =
  | { type: "known"; spell: CharacterKnownSpell }
  | { type: "trait"; spell: CharacterTraitSpellChoice }
  | null;

function spellFlags(spell: {
  requires_concentration: boolean;
  requires_ritual: boolean;
}) {
  const flags: string[] = [];
  if (spell.requires_concentration) flags.push("Concentração");
  if (spell.requires_ritual) flags.push("Ritual");
  return flags.join(" · ");
}

function SpellDetailContent({ spell }: { spell: CharacterKnownSpell }) {
  return (
    <dl className="space-y-3">
      <div>
        <dt className="text-xs text-muted-subtle">Nível</dt>
        <dd>{spellLevelLabel(spell.level)}</dd>
      </div>
      {spell.school ? (
        <div>
          <dt className="text-xs text-muted-subtle">Escola</dt>
          <dd>{spell.school}</dd>
        </div>
      ) : null}
      {spell.casting_time ? (
        <div>
          <dt className="text-xs text-muted-subtle">Tempo</dt>
          <dd>{spell.casting_time}</dd>
        </div>
      ) : null}
      {spell.range_text ? (
        <div>
          <dt className="text-xs text-muted-subtle">Alcance</dt>
          <dd>{spell.range_text}</dd>
        </div>
      ) : null}
      {spell.components ? (
        <div>
          <dt className="text-xs text-muted-subtle">Componentes</dt>
          <dd>
            {spell.components}
            {spell.material_component
              ? ` (${spell.material_component})`
              : ""}
          </dd>
        </div>
      ) : null}
      {spell.duration_text ? (
        <div>
          <dt className="text-xs text-muted-subtle">Duração</dt>
          <dd>{spell.duration_text}</dd>
        </div>
      ) : null}
      {spell.save_attribute ? (
        <div>
          <dt className="text-xs text-muted-subtle">Salvaguarda</dt>
          <dd>{abilityLabel(spell.save_attribute)}</dd>
        </div>
      ) : null}
      {spell.attack_type ? (
        <div>
          <dt className="text-xs text-muted-subtle">Ataque</dt>
          <dd>{spell.attack_type}</dd>
        </div>
      ) : null}
    </dl>
  );
}

export function CharacterSpellsSection({ character }: CharacterSpellsSectionProps) {
  const spellGroups = groupKnownSpells(character.known_spells);
  const traitGroup = groupTraitSpells(character.trait_spell_choices);
  const preparedSummary = preparedSpellSummary(
    character.known_spells,
    character.spellcasting_entries,
    character.abilities,
  );
  const [modal, setModal] = useState<SpellModalState>(null);
  const snippet = useCatalogSnippet(character.id);

  if (
    character.spellcasting_entries.length === 0 &&
    spellGroups.length === 0 &&
    !traitGroup
  ) {
    return null;
  }

  const openKnownSpell = (spell: CharacterKnownSpell) => {
    setModal({ type: "known", spell });
    snippet.fetchSnippet("spell", spell.spell_id);
  };

  const openTraitSpell = (spell: CharacterTraitSpellChoice) => {
    setModal({ type: "trait", spell });
    snippet.fetchSnippet("spell", spell.spell_id);
  };

  const closeModal = () => {
    setModal(null);
    snippet.reset();
  };

  const modalTitle =
    modal?.type === "known"
      ? modal.spell.name
      : modal?.type === "trait"
        ? modal.spell.spell_name
        : "";

  return (
    <>
      <Surface className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-foreground">Magias</h2>
          {preparedSummary ? (
            <span className="text-xs text-muted-subtle">{preparedSummary}</span>
          ) : null}
        </div>

        {character.spellcasting_entries.length > 0 ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {character.spellcasting_entries.map((entry) => (
              <div
                key={`${entry.class_id}:${entry.class_name}`}
                className="rounded-md border border-border/70 bg-surface/35 px-3 py-3"
              >
                <p className="text-sm font-medium text-foreground">
                  {entry.class_name} {entry.class_level}
                </p>
                <p className="mt-0.5 text-xs text-muted-subtle">
                  {abilityLabel(entry.spellcasting_ability)}
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-muted-subtle">Ataque</dt>
                    <dd className="mt-0.5 font-medium tabular-nums text-brand-soft">
                      {entry.spell_attack_bonus == null
                        ? "—"
                        : formatProficiencyBonus(entry.spell_attack_bonus)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-subtle">CD</dt>
                    <dd className="mt-0.5 font-medium tabular-nums text-foreground">
                      {entry.spell_save_dc ?? "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        ) : null}

        {spellGroups.map((group) => (
          <section key={group.key} className="mt-5">
            <h3 className="text-xs font-medium text-muted">{group.label}</h3>
            <div className="mt-2 grid gap-2">
              {group.spells.map((spell) => {
                const flags = spellFlags(spell);
                return (
                  <div
                    key={spell.spell_id}
                    className="rounded-md border border-border/70 bg-surface/30 px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {spell.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge tone="neutral">{spellLevelLabel(spell.level)}</Badge>
                        {group.key === "always_prepared" ? (
                          <Badge tone="success">Sempre preparada</Badge>
                        ) : group.key === "prepared" ? (
                          <Badge tone="accent">Preparada</Badge>
                        ) : null}
                        <button
                          type="button"
                          className="rounded-md p-1 text-muted-subtle transition-colors hover:text-foreground"
                          aria-label={`Detalhes de ${spell.name}`}
                          onClick={() => openKnownSpell(spell)}
                        >
                          <Info className="size-4" aria-hidden />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-muted-subtle">
                      {[spell.school, spell.casting_time, spell.range_text, flags]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {traitGroup ? (
          <section className="mt-5">
            <h3 className="text-xs font-medium text-muted">{traitGroup.label}</h3>
            <div className="mt-2 grid gap-2">
              {traitGroup.spells.map((spell) => (
                <div
                  key={`${spell.trait_id}:${spell.choice_group}:${spell.selection_key}`}
                  className="rounded-md border border-border/70 bg-surface/30 px-3 py-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {spell.spell_name}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone="neutral">{spellLevelLabel(spell.level)}</Badge>
                      <button
                        type="button"
                        className="rounded-md p-1 text-muted-subtle transition-colors hover:text-foreground"
                        aria-label={`Detalhes de ${spell.spell_name}`}
                        onClick={() => openTraitSpell(spell)}
                      >
                        <Info className="size-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-subtle">
                    {[spell.trait_name, spell.spell_list_name, spell.free_casts_per]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </Surface>

      <SheetDetailModal open={modal != null} title={modalTitle} onClose={closeModal}>
        {modal?.type === "known" ? (
          <>
            <SpellDetailContent spell={modal.spell} />
            {snippet.loading ? (
              <p className="mt-4">Carregando descrição…</p>
            ) : snippet.description ? (
              <p className="mt-4 whitespace-pre-wrap border-t border-border pt-4">
                {snippet.description}
              </p>
            ) : null}
          </>
        ) : modal?.type === "trait" ? (
          <>
            <p className="text-xs text-muted-subtle">
              {[modal.spell.trait_name, modal.spell.trait_option_name]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {snippet.loading ? (
              <p className="mt-4">Carregando descrição…</p>
            ) : snippet.description ? (
              <p className="mt-4 whitespace-pre-wrap">{snippet.description}</p>
            ) : (
              <p className="mt-4 text-muted-subtle">Sem descrição disponível.</p>
            )}
          </>
        ) : null}
      </SheetDetailModal>
    </>
  );
}
