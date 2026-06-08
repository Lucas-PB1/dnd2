import { Surface } from "@/components/ui/Surface";
import type { CharacterResourceEntry } from "@/features/character-sheet/domain/sheet-display";
import {
  formatResourceUses,
  resourceResetLabel,
} from "@/features/character-sheet/domain/sheet-display";

type CharacterResourcesSectionProps = {
  resources: CharacterResourceEntry[];
};

export function CharacterResourcesSection({
  resources,
}: CharacterResourcesSectionProps) {
  if (resources.length === 0) return null;

  return (
    <Surface className="p-6">
      <h2 className="text-sm font-medium text-foreground">Recursos de classe</h2>
      <p className="mt-1 text-xs text-muted">
        Cargas de recursos de classe (Rage, Second Wind, Ki…).
      </p>
      <ul className="mt-4 space-y-2">
        {resources.map((entry) => {
          const reset = resourceResetLabel(entry.reset_on);
          return (
            <li
              key={`${entry.trait_id ?? "x"}:${entry.resource_key ?? entry.name}`}
              className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-surface/40 px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-foreground">{entry.name}</p>
                {reset ? (
                  <p className="text-xs text-muted-subtle">{reset}</p>
                ) : null}
              </div>
              <span className="shrink-0 tabular-nums font-medium text-brand">
                {formatResourceUses(entry)}
              </span>
            </li>
          );
        })}
      </ul>
    </Surface>
  );
}
