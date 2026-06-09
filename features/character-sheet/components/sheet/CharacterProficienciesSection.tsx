import { Surface } from "@/components/ui/Surface";
import { groupProficiencies } from "@/features/character-sheet/domain/sheet-display";
import type { CharacterDetail } from "@/features/character-sheet/types/character.types";

type CharacterProficienciesSectionProps = {
  character: CharacterDetail;
};

export function CharacterProficienciesSection({
  character,
}: CharacterProficienciesSectionProps) {
  const groups = groupProficiencies(character.proficiencies);

  if (groups.length === 0) return null;

  return (
    <Surface className="p-5">
      <h2 className="text-sm font-medium text-foreground">Proficiências</h2>

      <div className="mt-4 space-y-4">
        {groups.map((group) => (
          <section key={group.label}>
            <h3 className="text-xs font-medium text-muted">{group.label}</h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {group.entries.map((entry) => (
                <li
                  key={`${entry.proficiency_type}:${entry.name}`}
                  className="rounded-full border border-border bg-surface/55 px-2.5 py-1 text-xs text-foreground"
                >
                  {entry.name}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Surface>
  );
}
