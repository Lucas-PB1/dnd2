import { Surface } from "@/components/ui/Surface";
import type { CharacterTraitOptionSummary } from "@/shared/character";

type CharacterTraitOptionsSectionProps = {
  options: CharacterTraitOptionSummary[];
};

export function CharacterTraitOptionsSection({
  options,
}: CharacterTraitOptionsSectionProps) {
  if (options.length === 0) return null;

  return (
    <Surface className="p-5">
      <h2 className="text-sm font-medium text-foreground">Escolhas de traço</h2>
      <ul className="mt-4 space-y-1.5">
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
              {option.option_description ? (
                <p className="mt-1 text-xs text-muted">
                  {option.option_description}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Surface>
  );
}
