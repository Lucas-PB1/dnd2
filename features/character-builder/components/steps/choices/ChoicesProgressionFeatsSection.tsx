import { ChipToggle, SelectionOptionCard } from "@/features/character-builder/components/shared/BuilderParts";
import type {
  BuilderProgressionFeat,
  BuilderTraitOption,
  CharacterBuilderData,
  CharacterBuilderState,
  ProgressionFeatLevel,
} from "@/features/character-builder/types/builder.types";
import { computePreviewAbilities } from "@/features/character-builder/domain/state/abilities";
import {
  ASI_FEAT_NAME,
  asiFeat,
  featsForProgressionSlot,
  progressionFeatLevelsForClass,
  progressionTraitOptionsForSlot,
  setProgressionFeatSlot,
  syncProgressionFeatSlots,
  toggleProgressionFeatTraitOption,
} from "@/features/character-builder/domain/progression/feats";
import { TraitOptionGroupSection } from "./TraitOptionGroupSection";

type ChoicesProgressionFeatsSectionProps = {
  data: CharacterBuilderData;
  state: CharacterBuilderState;
  onChange: (next: CharacterBuilderState) => void;
  onOptionInfo: (option: BuilderTraitOption) => void;
};

function slotLabel(atLevel: ProgressionFeatLevel): string {
  return atLevel === 19 ? "Nível 19 (Epic Boon ou feat)" : `Nível ${atLevel}`;
}

function selectedFeat(
  data: CharacterBuilderData,
  slot: ReturnType<typeof syncProgressionFeatSlots>[number],
): BuilderProgressionFeat | undefined {
  if (slot.kind !== "feat" || !slot.feat_id) return undefined;
  return data.progression_feats.find((feat) => feat.id === slot.feat_id);
}

export function ChoicesProgressionFeatsSection({
  data,
  state,
  onChange,
  onOptionInfo,
}: ChoicesProgressionFeatsSectionProps) {
  const slots = syncProgressionFeatSlots(state);
  const levels = progressionFeatLevelsForClass(state.class_level);
  if (levels.length === 0) return null;

  const abilities = computePreviewAbilities(data, state);
  if (!abilities) return null;
  const asi = asiFeat(data);

  return (
    <section className="space-y-4 border-b border-border pb-4">
      <div>
        <p className="text-sm font-medium text-foreground">
          Feats de progressão
        </p>
        <p className="text-xs text-muted">
          Nos níveis 4, 8, 12, 16 e 19 escolha ASI ou um feat elegível.
        </p>
      </div>

      {slots.map((slot) => {
        const eligibleFeats = featsForProgressionSlot(
          data,
          state,
          slot.at_level,
          abilities,
        );
        const activeFeat =
          slot.kind === "asi" ? asi : selectedFeat(data, slot);
        const traitSelections = progressionTraitOptionsForSlot(
          state,
          slot.at_level,
        );

        return (
          <div
            key={slot.at_level}
            className="rounded-lg border border-border p-3"
          >
            <p className="text-xs font-medium text-foreground">
              {slotLabel(slot.at_level)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <ChipToggle
                label="ASI"
                selected={slot.kind === "asi"}
                onToggle={() =>
                  onChange(
                    setProgressionFeatSlot(
                      state,
                      slot.at_level,
                      "asi",
                      asi?.id ?? null,
                    ),
                  )
                }
              />
              <ChipToggle
                label="Feat"
                selected={slot.kind === "feat"}
                onToggle={() =>
                  onChange(
                    setProgressionFeatSlot(state, slot.at_level, "feat", null),
                  )
                }
              />
            </div>

            {slot.kind === "feat" ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {eligibleFeats.map((feat) => (
                  <SelectionOptionCard
                    key={feat.id}
                    compact
                    title={feat.name}
                    description={feat.description ?? undefined}
                    selected={slot.feat_id === feat.id}
                    onSelect={() =>
                      onChange(
                        setProgressionFeatSlot(
                          state,
                          slot.at_level,
                          "feat",
                          feat.id,
                        ),
                      )
                    }
                  />
                ))}
              </div>
            ) : null}

            {activeFeat?.origin_feat_choices.map((group) => (
              <TraitOptionGroupSection
                key={`${slot.at_level}-${group.trait_id}-${group.option_group}`}
                sectionKey={`${slot.at_level}-${group.trait_id}-${group.option_group}`}
                title={
                  slot.kind === "asi"
                    ? `${ASI_FEAT_NAME}: ${group.trait_name}`
                    : `${activeFeat.name}: ${group.trait_name}`
                }
                traitDescription={group.trait_description}
                group={group}
                selections={traitSelections}
                data={data}
                state={state}
                onChange={onChange}
                onOptionInfo={onOptionInfo}
                buildNextState={(selection, max) =>
                  toggleProgressionFeatTraitOption(
                    state,
                    slot.at_level,
                    selection,
                    max,
                  )
                }
              />
            ))}
          </div>
        );
      })}
    </section>
  );
}
