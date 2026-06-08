import type {
  BuilderBackgroundEntry,
  BuilderClassEntry,
  BuilderOriginFeat,
  BuilderSpeciesEntry,
  BuilderTraitOption,
} from "@/features/character/types/builder.types";
import { ABILITY_LABELS } from "@/features/character/components/builder/BuilderParts";

export function SpeciesDetailContent({ species }: { species: BuilderSpeciesEntry }) {
  return (
    <div className="space-y-4 text-foreground">
      {species.description ? (
        <p className="whitespace-pre-wrap">{species.description}</p>
      ) : (
        <p className="text-muted">Sem descrição cadastrada.</p>
      )}
      <dl className="grid gap-2 rounded-lg border border-border bg-surface/40 p-3">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Tipo</dt>
          <dd>{species.creature_type}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Tamanho</dt>
          <dd>{species.size_options}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Deslocamento</dt>
          <dd>{species.base_speed} pés</dd>
        </div>
      </dl>
      {species.traits.length > 0 ? (
        <section>
          <h3 className="font-medium text-foreground">Traços</h3>
          <ul className="mt-2 space-y-2">
            {species.traits.map((trait) => (
              <li
                key={trait.trait_id}
                className="rounded-lg border border-border bg-surface/30 p-3"
              >
                <p className="font-medium text-foreground">{trait.name}</p>
                {trait.description ? (
                  <p className="mt-1 text-muted">{trait.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function ClassDetailContent({ cls }: { cls: BuilderClassEntry }) {
  return (
    <div className="space-y-4 text-foreground">
      <dl className="grid gap-2 rounded-lg border border-border bg-surface/40 p-3">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Dado de vida</dt>
          <dd>{cls.hit_die}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Salvaguardas</dt>
          <dd>
            {cls.saving_throws
              .map((s) => ABILITY_LABELS[s] ?? s)
              .join(", ") || "—"}
          </dd>
        </div>
      </dl>
      {cls.weapons.length > 0 ? (
        <section>
          <h3 className="font-medium">Armas</h3>
          <p className="mt-1 text-muted">{cls.weapons.join(", ")}</p>
        </section>
      ) : null}
      {cls.armor.length > 0 ? (
        <section>
          <h3 className="font-medium">Armaduras</h3>
          <p className="mt-1 text-muted">{cls.armor.join(", ")}</p>
        </section>
      ) : null}
      {cls.spellcasting &&
      (cls.spellcasting.cantrip_count > 0 ||
        cls.spellcasting.prepared_count > 0 ||
        cls.spellcasting.spellbook_count > 0) ? (
        <section>
          <h3 className="font-medium">Magias (nível 1)</h3>
          <ul className="mt-2 space-y-1 text-muted">
            {cls.spellcasting.cantrip_count > 0 ? (
              <li>{cls.spellcasting.cantrip_count} truque(s)</li>
            ) : null}
            {cls.spellcasting.spellbook_count > 0 ? (
              <li>{cls.spellcasting.spellbook_count} magia(s) no grimório</li>
            ) : null}
            {cls.spellcasting.prepared_count > 0 ? (
              <li>{cls.spellcasting.prepared_count} magia(s) preparada(s)</li>
            ) : null}
          </ul>
        </section>
      ) : null}
      {cls.expertise_choices.length > 0 ? (
        <section>
          <h3 className="font-medium">Expertise (nível 1)</h3>
          <ul className="mt-2 space-y-2">
            {cls.expertise_choices.map((group) => (
              <li key={group.trait_id} className="text-muted">
                <span className="font-medium text-foreground">
                  {group.trait_name}
                </span>
                : escolha {group.choice_count} perícia(s) proficiente(s)
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {cls.skill_choices.length > 0 ? (
        <section>
          <h3 className="font-medium">Perícias disponíveis</h3>
          <ul className="mt-2 space-y-2">
            {cls.skill_choices.map((group) => (
              <li key={group.choice_group} className="text-muted">
                <span className="font-medium text-foreground">
                  {group.choice_group}
                </span>
                {group.notes ? ` — ${group.notes}` : ""}: escolha{" "}
                {group.choice_count} entre{" "}
                {group.options.map((o) => o.name).join(", ")}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function BackgroundDetailContent({
  background,
}: {
  background: BuilderBackgroundEntry;
}) {
  return (
    <div className="space-y-4 text-foreground">
      {background.description ? (
        <p className="whitespace-pre-wrap">{background.description}</p>
      ) : (
        <p className="text-muted">Sem descrição cadastrada.</p>
      )}
      <dl className="grid gap-2 rounded-lg border border-border bg-surface/40 p-3">
        {background.origin_feat_name ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Feat de origem</dt>
            <dd>{background.origin_feat_name}</dd>
          </div>
        ) : null}
        {background.ability_options.length > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Atributos</dt>
            <dd>
              {background.ability_options
                .map((k) => ABILITY_LABELS[k] ?? k)
                .join(", ")}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

export function OriginFeatDetailContent({ feat }: { feat: BuilderOriginFeat }) {
  return (
    <div className="space-y-3 text-foreground">
      {feat.description ? (
        <p className="whitespace-pre-wrap">{feat.description}</p>
      ) : (
        <p className="text-muted">Sem descrição cadastrada.</p>
      )}
    </div>
  );
}

export function TraitOptionDetailContent({ option }: { option: BuilderTraitOption }) {
  return (
    <div className="space-y-2 text-foreground">
      <p className="font-medium">{option.name}</p>
      {option.description ? (
        <p className="text-muted">{option.description}</p>
      ) : (
        <p className="text-muted">Sem descrição adicional.</p>
      )}
    </div>
  );
}
