import { Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { spellLevelLabel } from "@/features/character-sheet/domain/sheet-display";
import type { TraitSpellGroup } from "@/features/character-sheet/domain/sheet-sections/spells-display";
import type { CharacterTraitSpellChoice } from "@/shared/character";

type TraitSpellGroupProps = {
  group: TraitSpellGroup | null;
  onOpen: (spell: CharacterTraitSpellChoice) => void;
};

export function TraitSpellGroup({ group, onOpen }: TraitSpellGroupProps) {
  if (!group) return null;

  return (
    <section className="mt-5">
      <h3 className="text-xs font-medium text-muted">{group.label}</h3>
      <div className="mt-2 grid gap-2">
        {group.spells.map((spell) => (
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
                  onClick={() => onOpen(spell)}
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
  );
}
