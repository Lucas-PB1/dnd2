import { Surface } from "@/components/ui/Surface";
import { formatActiveEffects } from "@/features/character-sheet/domain/sheet-sections/effects-display";
import { formatProficiencyBonus } from "@/features/character-sheet/domain/sheet-display";
import type {
  CharacterActiveEffect,
  CharacterStatModifier,
} from "@/features/character-sheet/types/character.types";

type CharacterEffectsSectionProps = {
  effects: CharacterActiveEffect[];
  modifiers: CharacterStatModifier[];
};

const KIND_LABELS = {
  modifier: "Modificador",
  damage: "Dano",
  status: "Status",
  condition: "Condição",
  proficiency: "Proficiência",
  raw: "Detalhe",
} as const;

export function CharacterEffectsSection({
  effects,
  modifiers,
}: CharacterEffectsSectionProps) {
  const formattedEffects = formatActiveEffects(effects);
  const activeModifiers = modifiers.filter((entry) => entry.is_active);

  if (formattedEffects.length === 0 && activeModifiers.length === 0) return null;

  return (
    <Surface className="p-5">
      <h2 className="text-sm font-medium text-foreground">Efeitos ativos</h2>

      {formattedEffects.length > 0 ? (
        <div className="mt-4 space-y-2">
          {formattedEffects.map(({ effect, lines }) => (
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
                  {lines.map((line) => (
                    <li key={`${effect.effect_name}:${line.text}`}>
                      <span className="text-muted-subtle">
                        {KIND_LABELS[line.kind]}:
                      </span>{" "}
                      {line.text}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
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
