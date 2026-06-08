import type {
  BuilderBackgroundEntry,
  BuilderClassEntry,
  BuilderOriginFeat,
  BuilderSpeciesEntry,
  BuilderTraitOption,
} from "@/features/character-builder/types/builder.types";
import { ABILITY_LABELS } from "@/features/character-builder/components/shared/BuilderParts";

export function SpeciesDetailContent({ species }: { species: BuilderSpeciesEntry }) {
  return (
    <div className="space-y-4 text-foreground">
      {species.description ? (
        <p className="whitespace-pre-wrap">{species.description}</p>
      ) : (
        <p className="text-muted">Sem descrição cadastrada.</p>
      )}
      <dl className="grid gap-2 rounded-lg border border-border bg-surface/35 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.035)]">
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
                className="rounded-lg border border-border bg-surface/30 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]"
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
  const levelOneFeatures = cls.features.filter(
    (feature) => feature.level_required === 1,
  );
  const earlyFeatures = cls.features.filter(
    (feature) => feature.level_required <= 3,
  );
  const featuresByLevel = cls.features.reduce<
    { level: number; features: typeof cls.features }[]
  >((acc, feature) => {
    let group = acc.find((entry) => entry.level === feature.level_required);
    if (!group) {
      group = { level: feature.level_required, features: [] };
      acc.push(group);
    }
    group.features.push(feature);
    return acc;
  }, []);

  const featureName = (name: string) =>
    name.startsWith(`${cls.name}: `) ? name.slice(cls.name.length + 2) : name;

  return (
    <div className="space-y-4 text-foreground">
      {levelOneFeatures.length > 0 ? (
        <section className="rounded-lg border border-brand/20 bg-brand-glow/20 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.035)]">
          <p className="text-xs font-medium uppercase text-brand-soft">
            Começa com
          </p>
          <p className="mt-1 text-sm text-foreground">
            {levelOneFeatures.map((feature) => featureName(feature.name)).join(", ")}
          </p>
        </section>
      ) : null}

      <dl className="grid gap-2 rounded-lg border border-border bg-surface/35 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.035)] sm:grid-cols-2">
        <div className="flex justify-between gap-4 sm:block">
          <dt className="text-muted">Dado de vida</dt>
          <dd className="font-medium text-foreground">{cls.hit_die}</dd>
        </div>
        <div className="flex justify-between gap-4 sm:block">
          <dt className="text-muted">Salvaguardas</dt>
          <dd className="font-medium text-foreground">
            {cls.saving_throws
              .map((s) => ABILITY_LABELS[s] ?? s)
              .join(", ") || "—"}
          </dd>
        </div>
        {cls.armor.length > 0 ? (
          <div className="flex justify-between gap-4 sm:block">
            <dt className="text-muted">Armaduras</dt>
            <dd className="font-medium text-foreground">
              {cls.armor.join(", ")}
            </dd>
          </div>
        ) : null}
        {cls.weapons.length > 0 ? (
          <div className="flex justify-between gap-4 sm:block">
            <dt className="text-muted">Armas</dt>
            <dd className="font-medium text-foreground">
              {cls.weapons.join(", ")}
            </dd>
          </div>
        ) : null}
      </dl>

      {earlyFeatures.length > 0 ? (
        <section>
          <h3 className="font-medium text-foreground">Traços decisivos</h3>
          <div className="mt-2 grid gap-2">
            {earlyFeatures.map((feature) => (
              <article
                key={`${feature.trait_id}-${feature.level_required}-early`}
                className="rounded-lg border border-border bg-surface/30 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h4 className="font-medium text-foreground">
                    {featureName(feature.name)}
                  </h4>
                  <span className="shrink-0 rounded-md border border-border-muted bg-surface-elevated/70 px-2 py-0.5 text-xs text-muted-subtle">
                    Nível {feature.level_required}
                  </span>
                </div>
                {feature.description ? (
                  <p className="mt-1 line-clamp-3 text-muted">
                    {feature.description}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
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
      {featuresByLevel.length > 0 ? (
        <section>
          <h3 className="font-medium text-foreground">Progressão de classe</h3>
          <div className="mt-2 grid gap-1.5">
            {featuresByLevel.map((group) => (
              <div
                key={group.level}
                className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 rounded-lg border border-border bg-surface/25 px-3 py-2"
              >
                <p className="text-xs font-medium uppercase text-muted-subtle">
                  Nível {group.level}
                </p>
                <p className="text-sm text-muted">
                  {group.features.map((feature) => featureName(feature.name)).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {cls.subclasses.length > 0 ? (
        <section>
          <h3 className="font-medium text-foreground">Subclasses</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {cls.subclasses.map((subclass) => (
              <article
                key={subclass.id}
                className="rounded-lg border border-border bg-surface/30 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]"
              >
                <h4 className="font-medium text-foreground">{subclass.name}</h4>
                {subclass.description ? (
                  <p className="mt-1 line-clamp-3 text-muted">
                    {subclass.description}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
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
      <dl className="grid gap-2 rounded-lg border border-border bg-surface/35 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.035)]">
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
      {background.origin_feat_description ? (
        <section className="rounded-lg border border-border bg-surface/30 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]">
          <h3 className="font-medium text-foreground">
            {background.origin_feat_name ?? "Talento de origem"}
          </h3>
          <p className="mt-1 whitespace-pre-wrap text-muted">
            {background.origin_feat_description}
          </p>
        </section>
      ) : null}
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
