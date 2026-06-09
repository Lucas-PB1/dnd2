import { Badge } from "@/components/ui/Badge";
import { Surface } from "@/components/ui/Surface";
import {
  abilityLabel,
  formatProficiencyBonus,
} from "@/features/character-sheet/domain/sheet-display";
import type { CharacterDetail } from "@/features/character-sheet/types/character.types";

type CharacterCombatSectionProps = {
  character: CharacterDetail;
};

export function CharacterCombatSection({ character }: CharacterCombatSectionProps) {
  const weapons = character.weapons;

  if (!weapons.length) return null;

  return (
    <Surface className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-foreground">Ataques</h2>
        <span className="text-xs text-muted-subtle">
          {weapons.length} {weapons.length === 1 ? "arma" : "armas"}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        {weapons.map((weapon) => (
          <div
            key={weapon.item_id}
            className="rounded-md border border-border/70 bg-surface/35 px-3 py-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {weapon.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-subtle">
                  {abilityLabel(weapon.attack_ability)}
                  {weapon.properties ? ` · ${weapon.properties}` : ""}
                </p>
              </div>
              {weapon.is_equipped ? <Badge tone="success">Equipada</Badge> : null}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs text-muted-subtle">Ataque</dt>
                <dd className="mt-0.5 font-medium tabular-nums text-brand-soft">
                  {weapon.attack_bonus == null
                    ? "—"
                    : formatProficiencyBonus(weapon.attack_bonus)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-subtle">Dano</dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {weapon.damage_formula ?? "—"}
                  {weapon.damage_type ? ` ${weapon.damage_type}` : ""}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </Surface>
  );
}
