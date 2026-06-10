import {
  abilityLabel,
  spellLevelLabel,
} from "@/features/character-sheet/domain/sheet-display";
import type { CharacterKnownSpell } from "@/shared/character";

export function SpellDetailContent({ spell }: { spell: CharacterKnownSpell }) {
  return (
    <dl className="space-y-3">
      <div>
        <dt className="text-xs text-muted-subtle">Nível</dt>
        <dd>{spellLevelLabel(spell.level)}</dd>
      </div>
      {spell.school ? (
        <div>
          <dt className="text-xs text-muted-subtle">Escola</dt>
          <dd>{spell.school}</dd>
        </div>
      ) : null}
      {spell.casting_time ? (
        <div>
          <dt className="text-xs text-muted-subtle">Tempo</dt>
          <dd>{spell.casting_time}</dd>
        </div>
      ) : null}
      {spell.range_text ? (
        <div>
          <dt className="text-xs text-muted-subtle">Alcance</dt>
          <dd>{spell.range_text}</dd>
        </div>
      ) : null}
      {spell.components ? (
        <div>
          <dt className="text-xs text-muted-subtle">Componentes</dt>
          <dd>
            {spell.components}
            {spell.material_component ? ` (${spell.material_component})` : ""}
          </dd>
        </div>
      ) : null}
      {spell.duration_text ? (
        <div>
          <dt className="text-xs text-muted-subtle">Duração</dt>
          <dd>{spell.duration_text}</dd>
        </div>
      ) : null}
      {spell.save_attribute ? (
        <div>
          <dt className="text-xs text-muted-subtle">Salvaguarda</dt>
          <dd>{abilityLabel(spell.save_attribute)}</dd>
        </div>
      ) : null}
      {spell.attack_type ? (
        <div>
          <dt className="text-xs text-muted-subtle">Ataque</dt>
          <dd>{spell.attack_type}</dd>
        </div>
      ) : null}
    </dl>
  );
}
