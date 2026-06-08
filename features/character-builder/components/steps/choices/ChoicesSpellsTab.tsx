import type {
  BuilderBackgroundEntry,
  BuilderClassEntry,
  BuilderOriginFeat,
} from "@/features/character-builder/types/builder.types";
import {
  classRequiresSpellSelection,
  toggleCantripSpell,
  togglePreparedSpell,
  toggleSpellbookSpell,
} from "@/features/character-builder/hooks/useCharacterBuilder";
import {
  cantripsForClass,
  level1SpellsForClass,
} from "@/features/character-builder/domain/spells/class-spells";
import { featRequiresSpellSelection } from "@/features/character-builder/domain/spells/feat-spells";
import { mergeOriginFeatTraitOptions } from "@/features/character-builder/domain/origin-feat";
import { spellIdsTakenElsewhere, visibleSpells } from "@/features/character-builder/domain/selection";
import type { ChoicesTabProps } from "./types";
import { FeatSpellPicker } from "./FeatSpellPicker";
import { SpellPickerSection } from "./SpellPickerSection";

type ChoicesSpellsTabProps = ChoicesTabProps & {
  cls: BuilderClassEntry;
  background: BuilderBackgroundEntry;
  humanFeat: BuilderOriginFeat | undefined;
  cantripFilter: string;
  spellbookFilter: string;
  preparedFilter: string;
  featSpellFilter: string;
  onCantripFilterChange: (value: string) => void;
  onSpellbookFilterChange: (value: string) => void;
  onPreparedFilterChange: (value: string) => void;
  onFeatSpellFilterChange: (value: string) => void;
};

export function ChoicesSpellsTab({
  data,
  state,
  onChange,
  cls,
  background,
  humanFeat,
  cantripFilter,
  spellbookFilter,
  preparedFilter,
  featSpellFilter,
  onCantripFilterChange,
  onSpellbookFilterChange,
  onPreparedFilterChange,
  onFeatSpellFilterChange,
}: ChoicesSpellsTabProps) {
  const hasClassSpells = classRequiresSpellSelection(cls.spellcasting);
  const hasBackgroundFeatSpells = featRequiresSpellSelection(
    background.origin_feat_spellcasting,
  );
  const hasHumanFeatSpells = featRequiresSpellSelection(humanFeat?.spellcasting);
  const hasSpells =
    hasClassSpells || hasBackgroundFeatSpells || hasHumanFeatSpells;

  if (!hasSpells) return null;

  return (
    <div className="space-y-4">
      {cls.spellcasting?.spells.length === 0 && hasClassSpells ? (
        <p className="text-sm text-muted">
          Carregando lista de magias da classe…
        </p>
      ) : null}

      {cls.spellcasting && cls.spellcasting.cantrip_count > 0 ? (
        <SpellPickerSection
          title="Truques"
          hint={`Escolha ${cls.spellcasting.cantrip_count} truque(s)`}
          spells={visibleSpells(
            cantripsForClass(cls.spellcasting),
            state.cantrip_spell_ids,
            spellIdsTakenElsewhere(state, { cantrips: true }),
          )}
          selectedIds={state.cantrip_spell_ids}
          max={cls.spellcasting.cantrip_count}
          filter={cantripFilter}
          onFilterChange={onCantripFilterChange}
          onToggle={(spellId) =>
            onChange(toggleCantripSpell(state, data, spellId))
          }
        />
      ) : null}

      {cls.spellcasting?.uses_spellbook ? (
        <SpellPickerSection
          title="Grimório"
          hint={`Adicione ${cls.spellcasting.spellbook_count} magia(s) de nível 1`}
          spells={visibleSpells(
            level1SpellsForClass(cls.spellcasting),
            state.spellbook_spell_ids,
            spellIdsTakenElsewhere(state, { spellbook: true }),
          )}
          selectedIds={state.spellbook_spell_ids}
          max={cls.spellcasting.spellbook_count}
          filter={spellbookFilter}
          onFilterChange={onSpellbookFilterChange}
          onToggle={(spellId) =>
            onChange(toggleSpellbookSpell(state, data, spellId))
          }
        />
      ) : null}

      {cls.spellcasting && cls.spellcasting.prepared_count > 0 ? (
        <SpellPickerSection
          title="Magias preparadas"
          hint={
            cls.spellcasting.uses_spellbook
              ? `Escolha ${cls.spellcasting.prepared_count} magia(s) do grimório`
              : `Escolha ${cls.spellcasting.prepared_count} magia(s) de nível 1`
          }
          spells={visibleSpells(
            cls.spellcasting.uses_spellbook
              ? level1SpellsForClass(cls.spellcasting).filter((spell) =>
                  state.spellbook_spell_ids.includes(spell.spell_id),
                )
              : level1SpellsForClass(cls.spellcasting),
            state.prepared_spell_ids,
            spellIdsTakenElsewhere(state, {
              prepared: true,
              spellbook: cls.spellcasting.uses_spellbook,
            }),
          )}
          selectedIds={state.prepared_spell_ids}
          max={cls.spellcasting.prepared_count}
          filter={preparedFilter}
          onFilterChange={onPreparedFilterChange}
          onToggle={(spellId) =>
            onChange(togglePreparedSpell(state, data, spellId))
          }
        />
      ) : null}

      {cls.spellcasting?.uses_spellbook &&
      state.spellbook_spell_ids.length === 0 ? (
        <p className="text-xs text-muted">
          Adicione magias ao grimório antes de escolher as preparadas.
        </p>
      ) : null}

      {background.origin_feat_spellcasting ? (
        <FeatSpellPicker
          title="Magias do talento (antecedente)"
          featLabel={background.origin_feat_name ?? "Talent"}
          spellcasting={background.origin_feat_spellcasting}
          traitOptions={mergeOriginFeatTraitOptions(
            background,
            state.origin_feat_trait_options,
          )}
          originFeatChoices={background.origin_feat_choices}
          lockedSpellListName={background.origin_feat_selection_key}
          source="background"
          state={state}
          onChange={onChange}
          filter={featSpellFilter}
          onFilterChange={onFeatSpellFilterChange}
        />
      ) : null}

      {humanFeat?.spellcasting ? (
        <FeatSpellPicker
          title="Magias do talento (Versátil)"
          featLabel={humanFeat.name}
          spellcasting={humanFeat.spellcasting}
          traitOptions={state.human_origin_feat_trait_options}
          originFeatChoices={humanFeat.origin_feat_choices}
          source="human"
          state={state}
          onChange={onChange}
          filter={featSpellFilter}
          onFilterChange={onFeatSpellFilterChange}
        />
      ) : null}
    </div>
  );
}
