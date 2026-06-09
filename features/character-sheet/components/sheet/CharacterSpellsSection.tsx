import { Badge } from "@/components/ui/Badge";
import { Surface } from "@/components/ui/Surface";
import {
  abilityLabel,
  formatProficiencyBonus,
  sortSpells,
  spellLevelLabel,
} from "@/features/character-sheet/domain/sheet-display";
import type { CharacterDetail } from "@/features/character-sheet/types/character.types";

type CharacterSpellsSectionProps = {
  character: CharacterDetail;
};

function spellFlags(spell: { requires_concentration: boolean; requires_ritual: boolean }) {
  const flags: string[] = [];
  if (spell.requires_concentration) flags.push("Concentração");
  if (spell.requires_ritual) flags.push("Ritual");
  return flags.join(" · ");
}

export function CharacterSpellsSection({ character }: CharacterSpellsSectionProps) {
  const knownSpells = sortSpells(character.known_spells);
  const traitSpells = sortSpells(
    character.trait_spell_choices.map((entry) => ({
      ...entry,
      name: entry.spell_name,
    })),
  );

  if (
    character.spellcasting_entries.length === 0 &&
    knownSpells.length === 0 &&
    traitSpells.length === 0
  ) {
    return null;
  }

  return (
    <Surface className="p-5">
      <h2 className="text-sm font-medium text-foreground">Magias</h2>

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

      {knownSpells.length > 0 ? (
        <section className="mt-5">
          <h3 className="text-xs font-medium text-muted">Conhecidas/preparadas</h3>
          <div className="mt-2 grid gap-2">
            {knownSpells.map((spell) => {
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
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone="neutral">{spellLevelLabel(spell.level)}</Badge>
                      {spell.always_prepared ? (
                        <Badge tone="success">Sempre preparada</Badge>
                      ) : spell.is_prepared ? (
                        <Badge tone="accent">Preparada</Badge>
                      ) : null}
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
      ) : null}

      {traitSpells.length > 0 ? (
        <section className="mt-5">
          <h3 className="text-xs font-medium text-muted">Magias de traços</h3>
          <div className="mt-2 grid gap-2">
            {traitSpells.map((spell) => (
              <div
                key={`${spell.trait_id}:${spell.choice_group}:${spell.selection_key}`}
                className="rounded-md border border-border/70 bg-surface/30 px-3 py-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {spell.spell_name}
                  </p>
                  <Badge tone="neutral">{spellLevelLabel(spell.level)}</Badge>
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
  );
}
