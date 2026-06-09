import { Badge } from "@/components/ui/Badge";
import { Surface } from "@/components/ui/Surface";
import {
  abilityLabel,
  formatProficiencyBonus,
  sortByAbility,
  sortSkills,
} from "@/features/character-sheet/domain/sheet-display";
import type { CharacterDetail } from "@/features/character-sheet/types/character.types";

type CharacterAbilitiesSectionProps = {
  character: CharacterDetail;
};

function proficiencyText(proficient: boolean, expertise = false): string {
  if (expertise) return "Exp";
  if (proficient) return "Prof";
  return "";
}

export function CharacterAbilitiesSection({
  character,
}: CharacterAbilitiesSectionProps) {
  if (!character.abilities.length) return null;

  const saves = sortByAbility(character.saving_throws);
  const skills = sortSkills(character.skills);

  return (
    <Surface className="p-5">
      <h2 className="text-sm font-medium text-foreground">Atributos</h2>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {character.abilities.map((entry) => (
          <div
            key={entry.ability}
            className="rounded-md border border-border/70 bg-surface/35 px-3 py-3 text-center"
          >
            <p className="text-xs text-muted-subtle">{entry.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
              {entry.score}
            </p>
            <p className="text-sm font-medium tabular-nums text-brand-soft">
              {formatProficiencyBonus(entry.modifier)}
            </p>
          </div>
        ))}
      </div>

      {saves.length > 0 ? (
        <section className="mt-5">
          <h3 className="text-xs font-medium text-muted">Salvaguardas</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {saves.map((entry) => (
              <div
                key={entry.ability}
                className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-surface/30 px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate text-foreground">
                  {entry.label}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {entry.proficient ? <Badge tone="accent">Prof</Badge> : null}
                  <span className="tabular-nums text-brand-soft">
                    {formatProficiencyBonus(entry.modifier)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {skills.length > 0 ? (
        <section className="mt-5">
          <h3 className="text-xs font-medium text-muted">Perícias</h3>
          <div className="mt-2 grid gap-1.5 md:grid-cols-2">
            {skills.map((entry) => {
              const badge = proficiencyText(entry.proficient, entry.expertise);
              return (
                <div
                  key={entry.skill}
                  className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-md border border-border/60 bg-surface/25 px-3 py-2 text-sm"
                >
                  <span className="min-w-0 truncate text-foreground">
                    {entry.skill}
                  </span>
                  <span className="text-xs text-muted-subtle">
                    {abilityLabel(entry.base_attribute)}
                  </span>
                  <span className="flex min-w-16 justify-end gap-2 tabular-nums">
                    {badge ? (
                      <span className="text-xs text-accent-soft">{badge}</span>
                    ) : null}
                    <span className="font-medium text-brand-soft">
                      {formatProficiencyBonus(entry.modifier)}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </Surface>
  );
}
