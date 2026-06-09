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
  const options = character.trait_options;

  if (groups.length === 0 && options.length === 0) return null;

  return (
    <Surface className="p-5">
      <h2 className="text-sm font-medium text-foreground">Proficiências</h2>

      {groups.length > 0 ? (
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
      ) : null}

      {options.length > 0 ? (
        <section className="mt-5">
          <h3 className="text-xs font-medium text-muted">Escolhas de traços</h3>
          <ul className="mt-2 space-y-1.5">
            {options.map((option) => {
              const detail =
                option.option_skill_name ??
                option.option_tool_name ??
                option.option_spell_list_name;
              return (
                <li
                  key={`${option.trait_id}:${option.option_group}:${option.selection_key}`}
                  className="rounded-md border border-border/70 bg-surface/30 px-3 py-2 text-sm"
                >
                  <p className="text-foreground">{option.option_name}</p>
                  <p className="mt-0.5 text-xs text-muted-subtle">
                    {[option.trait_name, option.option_group, detail]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </Surface>
  );
}
