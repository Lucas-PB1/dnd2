import { ChipToggle, SelectionOptionCard } from "@/features/character-builder/components/shared/BuilderParts";
import type {
  BuilderBackgroundEntry,
  BuilderOriginFeat,
  BuilderSpeciesEntry,
  BuilderTraitOption,
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
import type { ChoicesTabProps } from "./types";
import { TraitOptionGroupSection } from "./TraitOptionGroupSection";

type ChoicesFeatsTabProps = ChoicesTabProps & {
  species: BuilderSpeciesEntry;
  background: BuilderBackgroundEntry;
  humanFeat: BuilderOriginFeat | undefined;
  onOptionInfo: (option: BuilderTraitOption) => void;
  onOriginFeatInfo: (featId: number, title: string) => void;
};

export function ChoicesFeatsTab({
  data,
  state,
  onChange,
  species,
  background,
  humanFeat,
  onOptionInfo,
  onOriginFeatInfo,
}: ChoicesFeatsTabProps) {
  const lockedOriginFeat = findLockedOriginFeatSelection(background);
  const visibleOriginFeatChoices = getVisibleOriginFeatChoices(background);
  const originFeatSelections = mergeOriginFeatTraitOptions(
    background,
    state.origin_feat_trait_options,
  );

  return (
    <div className="space-y-4">
      {species.name === "Human" ? (
        <section>
          <p className="text-xs text-muted">
            Humanos ganham um feat de origem adicional (Versátil).
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
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
          title={`${humanFeat.name}: ${group.trait_name}`}
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

      {lockedOriginFeat ? (
        <section>
          <p className="text-xs font-medium text-foreground">
            {background.origin_feat_name}: {lockedOriginFeat.trait_name}
          </p>
          <p className="text-xs text-muted">
            Definido pelo antecedente {background.name}.
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <ChipToggle
              label={lockedOriginFeat.option_name}
              selected
              disabled
              onToggle={() => {}}
            />
          </div>
        </section>
      ) : null}

      {visibleOriginFeatChoices.map((group) => (
        <TraitOptionGroupSection
          key={`${group.trait_id}-${group.option_group}`}
          sectionKey={`${group.trait_id}-${group.option_group}`}
          title={`${background.origin_feat_name}: ${group.trait_name}`}
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
    </div>
  );
}
