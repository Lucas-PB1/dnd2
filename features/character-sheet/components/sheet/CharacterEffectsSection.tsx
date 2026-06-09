import { Surface } from "@/components/ui/Surface";
import { formatProficiencyBonus } from "@/features/character-sheet/domain/sheet-display";
import type {
  CharacterActiveEffect,
  CharacterStatModifier,
} from "@/features/character-sheet/types/character.types";

type CharacterEffectsSectionProps = {
  effects: CharacterActiveEffect[];
  modifiers: CharacterStatModifier[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatObject(value: unknown): string | null {
  if (!isRecord(value)) return null;

  const parts = Object.entries(value).flatMap(([key, entry]) => {
    if (entry == null || entry === "") return [];
    if (
      typeof entry !== "string" &&
      typeof entry !== "number" &&
      typeof entry !== "boolean"
    ) {
      return [];
    }
    return [`${key}: ${entry}`];
  });

  return parts.length > 0 ? parts.join(" · ") : null;
}

function compactEntries(values: unknown[]): string[] {
  return values.flatMap((entry) => {
    const formatted = formatObject(entry);
    return formatted ? [formatted] : [];
  });
}

function effectLines(effect: CharacterActiveEffect): string[] {
  return [
    ...compactEntries(effect.modifiers),
    ...compactEntries(effect.damage_adjustments),
    ...compactEntries(effect.statuses),
    ...compactEntries(effect.condition_adjustments),
    ...compactEntries(effect.proficiencies),
  ];
}

export function CharacterEffectsSection({
  effects,
  modifiers,
}: CharacterEffectsSectionProps) {
  const activeEffects = effects.filter((entry) => entry.is_active);
  const activeModifiers = modifiers.filter((entry) => entry.is_active);

  if (activeEffects.length === 0 && activeModifiers.length === 0) return null;

  return (
    <Surface className="p-5">
      <h2 className="text-sm font-medium text-foreground">Efeitos ativos</h2>

      {activeEffects.length > 0 ? (
        <div className="mt-4 space-y-2">
          {activeEffects.map((effect) => {
            const lines = effectLines(effect);
            return (
              <div
                key={`${effect.source_type}:${effect.source_name}:${effect.effect_name}`}
                className="rounded-md border border-border/70 bg-surface/35 px-3 py-3"
              >
                <p className="text-sm font-medium text-foreground">
                  {effect.effect_name}
                </p>
                <p className="mt-0.5 text-xs text-muted-subtle">
                  {[effect.source_name, effect.duration_text]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {lines.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-xs text-muted">
                    {lines.slice(0, 4).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {activeModifiers.length > 0 ? (
        <section className="mt-5">
          <h3 className="text-xs font-medium text-muted">Modificadores</h3>
          <ul className="mt-2 space-y-1.5">
            {activeModifiers.map((modifier) => (
              <li
                key={`${modifier.source_name}:${modifier.affected_stat}:${modifier.operation}`}
                className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-surface/30 px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate text-foreground">
                  {modifier.affected_stat}
                </span>
                <span className="shrink-0 text-xs text-muted-subtle">
                  {modifier.source_name}
                </span>
                <span className="shrink-0 tabular-nums text-brand-soft">
                  {formatProficiencyBonus(modifier.modifier_value)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Surface>
  );
}
