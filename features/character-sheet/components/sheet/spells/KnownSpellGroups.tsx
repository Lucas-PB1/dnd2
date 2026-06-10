import { Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { spellLevelLabel } from "@/features/character-sheet/domain/sheet-display";
import type { SpellGroup } from "@/features/character-sheet/domain/sheet-sections/spells-display";
import type { CharacterKnownSpell } from "@/shared/character";

type KnownSpellGroupsProps = {
  groups: SpellGroup[];
  onOpen: (spell: CharacterKnownSpell) => void;
};

function spellFlags(spell: {
  requires_concentration: boolean;
  requires_ritual: boolean;
}) {
  const flags: string[] = [];
  if (spell.requires_concentration) flags.push("Concentração");
  if (spell.requires_ritual) flags.push("Ritual");
  return flags.join(" · ");
}

export function KnownSpellGroups({ groups, onOpen }: KnownSpellGroupsProps) {
  return groups.map((group) => (
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
                <p className="text-sm font-medium text-foreground">{spell.name}</p>
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
                    onClick={() => onOpen(spell)}
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
  ));
}
