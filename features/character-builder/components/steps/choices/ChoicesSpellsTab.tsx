import type {
  BuilderBackgroundEntry,
  BuilderClassEntry,
  BuilderOriginFeat,
  BuilderSpellOption,
} from "@/features/character-builder/types/builder.types";
import {
  classRequiresSpellSelection,
  toggleCantripSpell,
  togglePreparedSpell,
  toggleSpellbookSpell,
} from "@/features/character-builder/hooks/useCharacterBuilder";
import {
  cantripsForClass,
  leveledSpellsForClass,
  preparedSpellPoolForClass,
} from "@/features/character-builder/domain/spells/class-spells";
import {
  featRequiresSpellSelection,
  progressionFeatSpellKeyPrefix,
  totalProgressionFeatSpellChoicesRequired,
} from "@/features/character-builder/domain/spells/feat-spells";
import {
  progressionTraitOptionsForSlot,
  syncProgressionFeatSlots,
} from "@/features/character-builder/domain/progression/feats";
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
  onSpellInfo: (spell: BuilderSpellOption) => void;
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
  onSpellInfo,
}: ChoicesSpellsTabProps) {
  const hasClassSpells = classRequiresSpellSelection(cls.spellcasting);
  const hasBackgroundFeatSpells = featRequiresSpellSelection(
    background.origin_feat_spellcasting,
  );
  const hasHumanFeatSpells = featRequiresSpellSelection(humanFeat?.spellcasting);
  const progressionFeatSpellSlots = syncProgressionFeatSlots(state).filter((slot) => {
    if (slot.kind !== "feat" || !slot.feat_id) return false;
    const feat = data.progression_feats.find((entry) => entry.id === slot.feat_id);
    return featRequiresSpellSelection(feat?.spellcasting);
  });
  const hasProgressionFeatSpells = progressionFeatSpellSlots.length > 0;
  const hasSpells =
    hasClassSpells ||
    hasBackgroundFeatSpells ||
    hasHumanFeatSpells ||
    hasProgressionFeatSpells;

  const maxSpellLevel = cls.spellcasting?.max_spell_level ?? 1;
  const preparedPool = cls.spellcasting
    ? preparedSpellPoolForClass(cls.spellcasting, maxSpellLevel)
    : [];
  const spellbookPool = cls.spellcasting
    ? leveledSpellsForClass(cls.spellcasting, maxSpellLevel)
    : [];
  const leveledLabel =
    maxSpellLevel <= 1 ? "nível 1" : `nível 1–${maxSpellLevel}`;

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
          onSpellInfo={onSpellInfo}
        />
      ) : null}

      {cls.spellcasting?.uses_spellbook ? (
        <SpellPickerSection
          title="Grimório"
          hint={`Adicione ${cls.spellcasting.spellbook_count} magia(s) (${leveledLabel})`}
          spells={visibleSpells(
            spellbookPool,
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
          onSpellInfo={onSpellInfo}
        />
      ) : null}

      {cls.spellcasting && cls.spellcasting.prepared_count > 0 ? (
        <SpellPickerSection
          title="Magias preparadas"
          hint={
            cls.spellcasting.uses_magical_secrets
              ? `Escolha ${cls.spellcasting.prepared_count} magia(s) (Magical Secrets: listas Bardo, Clérigo, Druida e Mago)`
              : cls.spellcasting.uses_spellbook
                ? `Escolha ${cls.spellcasting.prepared_count} magia(s) do grimório`
                : `Escolha ${cls.spellcasting.prepared_count} magia(s) (${leveledLabel})`
          }
          spells={visibleSpells(
            cls.spellcasting.uses_spellbook
              ? spellbookPool.filter((spell) =>
                  state.spellbook_spell_ids.includes(spell.spell_id),
                )
              : preparedPool,
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
          onSpellInfo={onSpellInfo}
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
          onSpellInfo={onSpellInfo}
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
          onSpellInfo={onSpellInfo}
        />
      ) : null}

      {progressionFeatSpellSlots.map((slot) => {
        const feat = data.progression_feats.find(
          (entry) => entry.id === slot.feat_id,
        );
        if (!feat?.spellcasting) return null;

        return (
          <FeatSpellPicker
            key={slot.at_level}
            title={`Magias do feat (nível ${slot.at_level})`}
            featLabel={feat.name}
            spellcasting={feat.spellcasting}
            traitOptions={progressionTraitOptionsForSlot(state, slot.at_level)}
            originFeatChoices={feat.origin_feat_choices}
            source="progression"
            selectionKeyPrefix={progressionFeatSpellKeyPrefix(slot.at_level)}
            state={state}
            onChange={onChange}
            filter={featSpellFilter}
            onFilterChange={onFeatSpellFilterChange}
            onSpellInfo={onSpellInfo}
          />
        );
      })}
    </div>
  );
}
