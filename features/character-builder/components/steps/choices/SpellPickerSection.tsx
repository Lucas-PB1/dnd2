import { Input } from "@/components/ui/Input";
import { SelectionOptionCard } from "@/features/character-builder/components/shared/BuilderParts";
import type { BuilderSpellOption } from "@/features/character-builder/types/builder.types";
import { spellSelectionFacts } from "./spell-chip-label";
import { spellEffectText } from "@/features/character-builder/domain/spells/spell-display";

type SpellPickerSectionProps = {
  title: string;
  hint: string;
  spells: BuilderSpellOption[];
  selectedIds: number[];
  max: number;
  disabledIds?: number[];
  filter: string;
  onFilterChange: (value: string) => void;
  onToggle: (spellId: number) => void;
  onSpellInfo?: (spell: BuilderSpellOption) => void;
};

export function SpellPickerSection({
  title,
  hint,
  spells,
  selectedIds,
  max,
  disabledIds = [],
  filter,
  onFilterChange,
  onToggle,
  onSpellInfo,
}: SpellPickerSectionProps) {
  const normalizedFilter = filter.trim().toLowerCase();
  const filteredSpells = normalizedFilter
    ? spells.filter(
        (spell) =>
          spell.name.toLowerCase().includes(normalizedFilter) ||
          (spellEffectText(spell) ?? "").toLowerCase().includes(normalizedFilter),
      )
    : spells;

  return (
    <section>
      <p className="text-xs font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted">
        {hint} — {selectedIds.length}/{max}
      </p>
      {spells.length > 8 ? (
        <Input
          value={filter}
          onChange={(event) => onFilterChange(event.target.value)}
          placeholder="Filtrar magias…"
          className="mt-2 h-8 text-sm"
          aria-label={`Filtrar ${title.toLowerCase()}`}
        />
      ) : null}
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {filteredSpells.map((spell) => {
          const selected = selectedIds.includes(spell.spell_id);
          const disabled =
            disabledIds.includes(spell.spell_id) ||
            (!selected && selectedIds.length >= max);

          return (
            <SelectionOptionCard
              key={spell.spell_id}
              compact
              title={spell.name}
              facts={spellSelectionFacts(spell)}
              factsColumns={3}
              selected={selected}
              disabled={disabled}
              onSelect={() => onToggle(spell.spell_id)}
              onInfo={
                onSpellInfo ? () => onSpellInfo(spell) : undefined
              }
            />
          );
        })}
      </div>
      {filteredSpells.length === 0 ? (
        <p className="mt-2 text-xs text-muted">Nenhuma magia encontrada.</p>
      ) : null}
    </section>
  );
}
