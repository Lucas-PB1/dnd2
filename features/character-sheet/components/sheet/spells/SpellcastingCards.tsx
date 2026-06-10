import {
  abilityLabel,
  formatProficiencyBonus,
} from "@/features/character-sheet/domain/sheet-display";
import type { CharacterSpellcastingBlock } from "@/shared/character";

type SpellcastingCardsProps = {
  entries: CharacterSpellcastingBlock[];
};

export function SpellcastingCards({ entries }: SpellcastingCardsProps) {
  if (entries.length === 0) return null;

  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      {entries.map((entry) => (
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
  );
}
