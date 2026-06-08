import { Input } from "@/components/ui/Input";
import { ChipToggle } from "@/features/character-builder/components/shared/BuilderParts";
import type { BuilderSpellOption } from "@/features/character-builder/types/builder.types";
import { spellChipLabel } from "./spell-chip-label";

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
}: SpellPickerSectionProps) {
  const normalizedFilter = filter.trim().toLowerCase();
  const filteredSpells = normalizedFilter
    ? spells.filter((spell) =>
        spell.name.toLowerCase().includes(normalizedFilter),
      )
    : spells;

  return (
    <section>
      <p className="text-xs font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted">
        {hint} — {selectedIds.length}/{max}
      </p>
      {spells.length > 12 ? (
        <Input
          value={filter}
          onChange={(event) => onFilterChange(event.target.value)}
          placeholder="Filtrar magias…"
          className="mt-2 h-8 text-sm"
          aria-label={`Filtrar ${title.toLowerCase()}`}
        />
      ) : null}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {filteredSpells.map((spell) => {
          const selected = selectedIds.includes(spell.spell_id);
          const disabled =
            disabledIds.includes(spell.spell_id) ||
            (!selected && selectedIds.length >= max);
          return (
            <ChipToggle
              key={spell.spell_id}
              label={spellChipLabel(spell)}
              selected={selected}
              disabled={disabled}
              onToggle={() => onToggle(spell.spell_id)}
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
