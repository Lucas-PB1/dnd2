import { Surface } from "@/components/ui/Surface";
import type { CharacterTraitEntry } from "@/features/character-sheet/domain/sheet-display";
import {
  formatTraitLevel,
  groupTraitsBySource,
} from "@/features/character-sheet/domain/sheet-display";

type CharacterTraitsSectionProps = {
  traits: CharacterTraitEntry[];
};

export function CharacterTraitsSection({ traits }: CharacterTraitsSectionProps) {
  const groups = groupTraitsBySource(traits);
  if (groups.length === 0) return null;

  return (
    <Surface className="p-6">
      <h2 className="text-sm font-medium text-foreground">Traços de classe</h2>
      <p className="mt-1 text-xs text-muted">
        Features passivas até o nível atual (classe e subclasse).
      </p>
      <div className="mt-4 space-y-4">
        {groups.map((group) => (
          <section key={group.source}>
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-subtle">
              {group.source}
            </h3>
            <ul className="mt-2 space-y-1.5">
              {group.traits.map((entry) => {
                const levelLabel = formatTraitLevel(entry.level_required);
                return (
                  <li
                    key={`${entry.source_type}:${entry.trait_id}`}
                    className="flex items-baseline justify-between gap-3 text-sm"
                  >
                    <span className="text-foreground">{entry.trait_name}</span>
                    {levelLabel ? (
                      <span className="shrink-0 text-xs tabular-nums text-muted-subtle">
                        {levelLabel}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </Surface>
  );
}
