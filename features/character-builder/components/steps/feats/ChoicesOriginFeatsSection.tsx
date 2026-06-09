import { ChipToggle, SelectionOptionCard } from "@/features/character-builder/components/shared/BuilderParts";
import type {
  BuilderBackgroundEntry,
  BuilderOriginFeat,
  BuilderSpeciesEntry,
  BuilderTraitOption,
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";
import {
  setHumanOriginFeat,
  toggleHumanOriginFeatTraitOption,
  toggleOriginFeatTraitOption,
} from "@/features/character-builder/hooks/useCharacterBuilder";
import {
  findLockedOriginFeatSelection,
  getVisibleOriginFeatChoices,
  mergeOriginFeatTraitOptions,
} from "@/features/character-builder/domain/origin-feat";
import { visibleHumanOriginFeats } from "@/features/character-builder/domain/selection";
import { TraitOptionGroupSection } from "../choices/TraitOptionGroupSection";

type ChoicesOriginFeatsSectionProps = {
  data: CharacterBuilderData;
  state: CharacterBuilderState;
  onChange: (next: CharacterBuilderState) => void;
  species: BuilderSpeciesEntry;
  background: BuilderBackgroundEntry;
  humanFeat: BuilderOriginFeat | undefined;
  onOptionInfo: (option: BuilderTraitOption) => void;
  onOriginFeatInfo: (featId: number, title: string) => void;
};

export function ChoicesOriginFeatsSection({
  data,
  state,
  onChange,
  species,
  background,
  humanFeat,
  onOptionInfo,
  onOriginFeatInfo,
}: ChoicesOriginFeatsSectionProps) {
  const lockedOriginFeat = findLockedOriginFeatSelection(background);
  const visibleOriginFeatChoices = getVisibleOriginFeatChoices(background);
  const originFeatSelections = mergeOriginFeatTraitOptions(
    background,
    state.origin_feat_trait_options,
  );

  return (
    <div className="space-y-5">
      {background.origin_feat_name ? (
        <header className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Feat de origem do antecedente
          </p>
          <p className="text-xs text-muted">
            {background.name} concede{" "}
            <span className="text-foreground">{background.origin_feat_name}</span>.
          </p>
        </header>
      ) : null}

      {lockedOriginFeat ? (
        <section className="rounded-lg border border-border/80 bg-surface/25 p-3">
          <p className="text-xs font-medium text-foreground">
            {lockedOriginFeat.trait_name}
          </p>
          <p className="mt-0.5 text-xs text-muted-subtle">
            Escolha fixa do antecedente: {lockedOriginFeat.option_name}.
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <ChipToggle
              label={lockedOriginFeat.option_name}
              selected
              disabled
              size="sm"
              onToggle={() => {}}
            />
          </div>
        </section>
      ) : null}

      {visibleOriginFeatChoices.map((group) => (
        <TraitOptionGroupSection
          key={`${group.trait_id}-${group.option_group}`}
          sectionKey={`${group.trait_id}-${group.option_group}`}
          title={group.trait_name}
          traitDescription={group.trait_description}
          group={group}
          selections={originFeatSelections}
          data={data}
          state={state}
          onChange={onChange}
          onOptionInfo={onOptionInfo}
          buildNextState={(selection, max) =>
            toggleOriginFeatTraitOption(state, data, selection, max)
          }
        />
      ))}

      {species.name === "Human" ? (
        <section className="space-y-3 border-t border-border pt-5">
          <header className="space-y-1">
            <p className="text-sm font-medium text-foreground">Versátil (Humano)</p>
            <p className="text-xs text-muted">
              Escolha um feat de origem adicional exclusivo dos humanos.
            </p>
          </header>
          <div className="grid gap-2 sm:grid-cols-2">
            {visibleHumanOriginFeats(data, state).map((feat) => (
              <SelectionOptionCard
                key={feat.id}
                compact
                title={feat.name}
                description={feat.description}
                selected={state.human_origin_feat_id === feat.id}
                onInfo={() => onOriginFeatInfo(feat.id, feat.name)}
                onSelect={() => onChange(setHumanOriginFeat(state, feat.id))}
              />
            ))}
          </div>
        </section>
      ) : null}

      {humanFeat?.origin_feat_choices.map((group) => (
        <TraitOptionGroupSection
          key={`human-${group.trait_id}-${group.option_group}`}
          sectionKey={`human-${group.trait_id}-${group.option_group}`}
          title={group.trait_name}
          traitDescription={group.trait_description}
          group={group}
          selections={state.human_origin_feat_trait_options}
          data={data}
          state={state}
          onChange={onChange}
          onOptionInfo={onOptionInfo}
          buildNextState={(selection, max) =>
            toggleHumanOriginFeatTraitOption(state, data, selection, max)
          }
        />
      ))}
    </div>
  );
}
