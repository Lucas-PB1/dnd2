import type {
  BuilderFeatSpellcasting,
  BuilderOriginFeatChoice,
  CharacterBuilderState,
  FeatSpellSource,
  TraitOptionSelection,
} from "@/features/character-builder/types/builder.types";
import {
  getFeatSpellSelectionsForSource,
  resolveFeatSpellListSelection,
  spellsForFeatGroup,
  toggleFeatSpellInGroup,
} from "@/features/character-builder/domain/spells/feat-spells";
import { spellIdsTakenElsewhere, visibleSpells } from "@/features/character-builder/domain/selection";
import { SpellPickerSection } from "./SpellPickerSection";

type FeatSpellPickerProps = {
  title: string;
  featLabel: string;
  spellcasting: BuilderFeatSpellcasting;
  traitOptions: TraitOptionSelection[];
  originFeatChoices: BuilderOriginFeatChoice[];
  lockedSpellListName?: string | null;
  source: FeatSpellSource;
  state: CharacterBuilderState;
  onChange: (next: CharacterBuilderState) => void;
  filter: string;
  onFilterChange: (value: string) => void;
};

export function FeatSpellPicker({
  title,
  featLabel,
  spellcasting,
  traitOptions,
  originFeatChoices,
  lockedSpellListName,
  source,
  state,
  onChange,
  filter,
  onFilterChange,
}: FeatSpellPickerProps) {
  const listSelection = resolveFeatSpellListSelection(
    spellcasting,
    traitOptions,
    originFeatChoices,
    lockedSpellListName,
  );

  if (!listSelection) {
    return (
      <section>
        <p className="text-xs font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted">
          Escolha a lista de magias do talento {featLabel} na aba Feats antes de
          selecionar as magias.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-lg border border-border/60 p-3">
      <div>
        <p className="text-xs font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted">
          {featLabel} — lista {listSelection.listName}
        </p>
      </div>
      {spellcasting.groups.map((group) => {
        const spells = spellsForFeatGroup(
          spellcasting,
          listSelection.listName,
          group.spell_level,
        );
        const selected = getFeatSpellSelectionsForSource(
          state,
          source,
          group.trait_id,
          group.choice_group,
        );
        const selectedIds = selected.map((entry) => entry.spell_id);
        const groupTitle =
          group.spell_level === 0
            ? "Truques do talento"
            : group.always_prepared
              ? "Magia de nível 1 (sempre preparada)"
              : `Magias de talento (${group.choice_group})`;

        const takenSpellIds = spellIdsTakenElsewhere(state, {
          featSources: [source],
        });

        return (
          <SpellPickerSection
            key={`${source}-${group.choice_group}`}
            title={groupTitle}
            hint={
              group.notes ??
              `Escolha ${group.choice_count} magia(s) da lista ${listSelection.listName}`
            }
            spells={visibleSpells(spells, selectedIds, takenSpellIds)}
            selectedIds={selectedIds}
            max={group.choice_count}
            filter={filter}
            onFilterChange={onFilterChange}
            onToggle={(spellId) =>
              onChange(
                toggleFeatSpellInGroup(state, {
                  source,
                  trait_id: group.trait_id,
                  choice_group: group.choice_group,
                  choice_count: group.choice_count,
                  spell_level: group.spell_level,
                  spell_id: spellId,
                }),
              )
            }
          />
        );
      })}
    </section>
  );
}
