import type {
  BuilderBackgroundEntry,
  BuilderClassEntry,
  BuilderClassFeature,
  BuilderOriginFeat,
  BuilderSubclassSummary,
  BuilderSpellOption,
  BuilderSpeciesEntry,
  BuilderTraitOption,
} from "@/features/character-builder/types/builder.types";
import { ABILITY_LABELS } from "@/features/character-builder/components/shared/BuilderParts";
import {
  BuilderDetailBody,
  BuilderDetailCard,
  BuilderDetailDisclosure,
  BuilderDetailDisclosureText,
  BuilderDetailFact,
  BuilderDetailFacts,
  BuilderDetailHighlight,
  BuilderDetailSection,
  BuilderDetailText,
} from "@/features/character-builder/components/shared/BuilderDetailParts";
import { FormattedGameText } from "@/features/character-builder/components/shared/formatGameText";
import {
  SPELL_METADATA_FIELDS,
  spellEffectText,
  spellLevelSchoolLabel,
  spellMetadataValue,
} from "@/features/character-builder/domain/spells/spell-display";

function stripNamePrefix(name: string, prefix: string): string {
  return name.startsWith(`${prefix}: `) ? name.slice(prefix.length + 2) : name;
}

function sortFeatures(features: BuilderClassFeature[]): BuilderClassFeature[] {
  return [...features].sort(
    (a, b) =>
      a.level_required - b.level_required ||
      a.name.localeCompare(b.name, "pt-BR"),
  );
}

function FeatureProgressionList({
  features,
  formatName,
}: {
  features: BuilderClassFeature[];
  formatName: (name: string) => string;
}) {
  if (features.length === 0) {
    return <p className="text-sm text-muted">Sem traços cadastrados.</p>;
  }

  return (
    <div className="grid gap-1.5">
      {sortFeatures(features).map((feature) => (
        <BuilderDetailDisclosure
          key={`${feature.trait_id}-${feature.level_required}`}
          meta={`Nível ${feature.level_required}`}
          title={formatName(feature.name)}
        >
          <BuilderDetailDisclosureText>{feature.description}</BuilderDetailDisclosureText>
        </BuilderDetailDisclosure>
      ))}
    </div>
  );
}

export function SpeciesDetailContent({ species }: { species: BuilderSpeciesEntry }) {
  return (
    <BuilderDetailBody>
      <BuilderDetailText>{species.description}</BuilderDetailText>

      {species.traits.length > 0 ? (
        <BuilderDetailHighlight label="Começa com">
          {species.traits.map((trait) => trait.name).join(", ")}
        </BuilderDetailHighlight>
      ) : null}

      <BuilderDetailFacts>
        <BuilderDetailFact label="Tipo" value={species.creature_type} />
        <BuilderDetailFact label="Tamanho" value={species.size_options} />
        <BuilderDetailFact
          label="Deslocamento"
          value={`${species.base_speed} pés`}
        />
      </BuilderDetailFacts>

      {species.traits.length > 0 ? (
        <BuilderDetailSection title="Traços">
          <ul className="space-y-2">
            {species.traits.map((trait) => {
              const options = trait.choice_groups.flatMap(
                (group) => group.options,
              );

              return (
                <li key={trait.trait_id}>
                  <BuilderDetailCard>
                    <p className="font-medium text-foreground">{trait.name}</p>
                    {trait.description ? (
                      <div className="mt-1">
                        <FormattedGameText>{trait.description}</FormattedGameText>
                      </div>
                    ) : null}
                    {options.length > 0 ? (
                      <ul className="mt-2 space-y-1.5 border-t border-border/70 pt-2">
                        {options.map((option) => (
                          <li key={option.trait_option_id} className="text-sm">
                            <span className="font-medium text-foreground">
                              {option.name}
                            </span>
                            {option.description ? (
                              <span className="text-muted">
                                {" "}
                                — {option.description}
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </BuilderDetailCard>
                </li>
              );
            })}
          </ul>
        </BuilderDetailSection>
      ) : null}
    </BuilderDetailBody>
  );
}

export function ClassDetailContent({ cls }: { cls: BuilderClassEntry }) {
  const levelOneFeatures = cls.features.filter(
    (feature) => feature.level_required === 1,
  );

  const featureName = (name: string) => stripNamePrefix(name, cls.name);

  return (
    <BuilderDetailBody>
      {levelOneFeatures.length > 0 ? (
        <BuilderDetailHighlight label="Começa com">
          {levelOneFeatures.map((feature) => featureName(feature.name)).join(", ")}
        </BuilderDetailHighlight>
      ) : null}

      <BuilderDetailFacts columns={2}>
        <BuilderDetailFact label="Dado de vida" value={cls.hit_die} />
        <BuilderDetailFact
          label="Salvaguardas"
          value={
            cls.saving_throws.map((s) => ABILITY_LABELS[s] ?? s).join(", ") ||
            "—"
          }
        />
        {cls.armor.length > 0 ? (
          <BuilderDetailFact label="Armaduras" value={cls.armor.join(", ")} />
        ) : null}
        {cls.weapons.length > 0 ? (
          <BuilderDetailFact label="Armas" value={cls.weapons.join(", ")} />
        ) : null}
      </BuilderDetailFacts>

      {cls.spellcasting &&
      (cls.spellcasting.cantrip_count > 0 ||
        cls.spellcasting.prepared_count > 0 ||
        cls.spellcasting.spellbook_count > 0) ? (
        <BuilderDetailSection title="Magias (nível 1)">
          <ul className="space-y-1 text-muted">
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
        </BuilderDetailSection>
      ) : null}

      {cls.features.length > 0 ? (
        <BuilderDetailSection title="Progressão de classe">
          <FeatureProgressionList
            features={cls.features}
            formatName={featureName}
          />
        </BuilderDetailSection>
      ) : null}

      {cls.subclasses.length > 0 ? (
        <BuilderDetailSection title="Subclasses">
          <div className="grid gap-2 sm:grid-cols-2">
            {cls.subclasses.map((subclass) => (
              <BuilderDetailDisclosure
                key={subclass.id}
                title={subclass.name}
                preview={subclass.description}
              >
                {subclass.description ? (
                  <BuilderDetailDisclosureText>
                    {subclass.description}
                  </BuilderDetailDisclosureText>
                ) : null}
                <div className={subclass.description ? "mt-3" : undefined}>
                  <p className="mb-1.5 text-xs font-medium uppercase text-muted-subtle">
                    Progressão
                  </p>
                  <FeatureProgressionList
                    features={subclass.features}
                    formatName={(name) => stripNamePrefix(name, subclass.name)}
                  />
                </div>
              </BuilderDetailDisclosure>
            ))}
          </div>
        </BuilderDetailSection>
      ) : null}

      {cls.expertise_choices.length > 0 ? (
        <BuilderDetailSection title="Expertise (nível 1)">
          <ul className="space-y-2">
            {cls.expertise_choices.map((group) => (
              <li key={group.trait_id} className="text-muted">
                <span className="font-medium text-foreground">
                  {group.trait_name}
                </span>
                : escolha {group.choice_count} perícia(s) proficiente(s)
              </li>
            ))}
          </ul>
        </BuilderDetailSection>
      ) : null}

      {cls.skill_choices.length > 0 ? (
        <BuilderDetailSection title="Perícias disponíveis">
          <ul className="space-y-2">
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
        </BuilderDetailSection>
      ) : null}
    </BuilderDetailBody>
  );
}

function formatBackgroundTools(
  options: BuilderBackgroundEntry["tool_proficiency_options"],
): string | null {
  if (options.length === 0) return null;

  return options
    .map((option) => {
      if (option.choice_count > 1) {
        return `${option.name} (escolha ${option.choice_count})`;
      }
      return option.name;
    })
    .join(", ");
}

export function BackgroundDetailContent({
  background,
}: {
  background: BuilderBackgroundEntry;
}) {
  const toolSummary = formatBackgroundTools(background.tool_proficiency_options);

  return (
    <BuilderDetailBody>
      <BuilderDetailText>{background.description}</BuilderDetailText>

      {background.origin_feat_name ? (
        <BuilderDetailHighlight label="Começa com">
          {background.origin_feat_name}
        </BuilderDetailHighlight>
      ) : null}

      <BuilderDetailFacts columns={2}>
        <BuilderDetailFact
          label="Atributos"
          value={
            background.ability_options.length > 0
              ? background.ability_options
                  .map((key) => ABILITY_LABELS[key] ?? key)
                  .join(", ")
              : null
          }
        />
        <BuilderDetailFact
          label="Perícias"
          value={
            background.skill_proficiencies.length > 0
              ? background.skill_proficiencies.map((skill) => skill.name).join(", ")
              : null
          }
        />
        <BuilderDetailFact label="Ferramentas" value={toolSummary} />
      </BuilderDetailFacts>

      {background.origin_feat_description ? (
        <BuilderDetailCard>
          <h3 className="font-medium text-foreground">
            {background.origin_feat_name ?? "Talento de origem"}
          </h3>
          <div className="mt-1">
            <FormattedGameText>
              {background.origin_feat_description}
            </FormattedGameText>
          </div>
        </BuilderDetailCard>
      ) : null}
    </BuilderDetailBody>
  );
}

export function OriginFeatDetailContent({ feat }: { feat: BuilderOriginFeat }) {
  return (
    <BuilderDetailBody>
      <BuilderDetailText>{feat.description}</BuilderDetailText>
    </BuilderDetailBody>
  );
}

export function TraitOptionDetailContent({ option }: { option: BuilderTraitOption }) {
  return (
    <BuilderDetailBody>
      <p className="font-medium">{option.name}</p>
      <BuilderDetailText fallback="Sem descrição adicional.">
        {option.description}
      </BuilderDetailText>
    </BuilderDetailBody>
  );
}

export function SpellDetailContent({ spell }: { spell: BuilderSpellOption }) {
  const effectText = spellEffectText(spell);
  const metadata = SPELL_METADATA_FIELDS.map(({ field, label }) => ({
    label,
    value: spellMetadataValue(spell, field),
  })).filter((entry) => entry.value);

  const tagParts = [
    spell.requires_concentration ? "Concentração" : null,
    spell.requires_ritual ? "Ritual" : null,
  ].filter(Boolean);

  return (
    <BuilderDetailBody>
      <BuilderDetailHighlight label="Tipo">
        <span className="font-medium">{spellLevelSchoolLabel(spell)}</span>
        {tagParts.length > 0 ? (
          <span className="text-muted"> · {tagParts.join(" · ")}</span>
        ) : null}
      </BuilderDetailHighlight>

      {metadata.length > 0 ? (
        <BuilderDetailFacts columns={3}>
          {metadata.map((entry) => (
            <BuilderDetailFact
              key={entry.label}
              label={entry.label}
              value={entry.value}
            />
          ))}
        </BuilderDetailFacts>
      ) : null}

      <BuilderDetailCard>
        <h3 className="font-medium text-foreground">Efeito</h3>
        <div className="mt-2">
          {effectText ? (
            <FormattedGameText>{effectText}</FormattedGameText>
          ) : (
            <p className="text-sm text-muted">Sem descrição cadastrada.</p>
          )}
        </div>
      </BuilderDetailCard>
    </BuilderDetailBody>
  );
}

export function SubclassDetailContent({
  subclass,
}: {
  subclass: BuilderSubclassSummary;
}) {
  return (
    <BuilderDetailBody>
      {subclass.description ? (
        <BuilderDetailText>{subclass.description}</BuilderDetailText>
      ) : null}
      {subclass.features.length > 0 ? (
        <BuilderDetailSection title="Progressão">
          <FeatureProgressionList
            features={subclass.features}
            formatName={(name) => stripNamePrefix(name, subclass.name)}
          />
        </BuilderDetailSection>
      ) : null}
    </BuilderDetailBody>
  );
}
