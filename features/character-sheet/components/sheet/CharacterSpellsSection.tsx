"use client";

import { useState } from "react";
import { Surface } from "@/components/ui/Surface";
import { KnownSpellGroups } from "@/features/character-sheet/components/sheet/spells/KnownSpellGroups";
import { SpellDetailDialog } from "@/features/character-sheet/components/sheet/spells/SpellDetailDialog";
import { SpellcastingCards } from "@/features/character-sheet/components/sheet/spells/SpellcastingCards";
import type { SpellModalState } from "@/features/character-sheet/components/sheet/spells/spell-section-types";
import { TraitSpellGroup } from "@/features/character-sheet/components/sheet/spells/TraitSpellGroup";
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
} from "@/shared/character";

type CharacterSpellsSectionProps = {
  character: CharacterDetail;
};

export function CharacterSpellsSection({ character }: CharacterSpellsSectionProps) {
  const spellGroups = groupKnownSpells(character.known_spells);
  const traitGroup = groupTraitSpells(character.trait_spell_choices);
  const preparedSummary = preparedSpellSummary(
    character.known_spells,
    character.spellcasting_entries,
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

  return (
    <>
      <Surface className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-foreground">Magias</h2>
          {preparedSummary ? (
            <span className="text-xs text-muted-subtle">{preparedSummary}</span>
          ) : null}
        </div>

        <SpellcastingCards entries={character.spellcasting_entries} />
        <KnownSpellGroups groups={spellGroups} onOpen={openKnownSpell} />
        <TraitSpellGroup group={traitGroup} onOpen={openTraitSpell} />
      </Surface>

      <SpellDetailDialog
        modal={modal}
        loading={snippet.loading}
        description={snippet.description}
        onClose={closeModal}
      />
    </>
  );
}
