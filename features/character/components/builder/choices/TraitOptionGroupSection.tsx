import { ChipToggle } from "@/features/character/components/builder/BuilderParts";
import type {
  BuilderTraitOption,
  CharacterBuilderData,
  CharacterBuilderState,
  TraitOptionSelection,
} from "@/features/character/types/builder.types";
import { visibleTraitOptions } from "@/lib/character/builder-selection";
import { selectionKey } from "@/lib/character/builder-utils";

type TraitGroup = {
  trait_id: number;
  option_group: string;
  choice_count: number;
  notes?: string | null;
  options: BuilderTraitOption[];
};

type TraitOptionGroupSectionProps = {
  sectionKey: string;
  title: string;
  group: TraitGroup;
  selections: TraitOptionSelection[];
  data: CharacterBuilderData;
  state: CharacterBuilderState;
  onChange: (next: CharacterBuilderState) => void;
  buildNextState: (
    selection: TraitOptionSelection,
    max: number,
  ) => CharacterBuilderState;
  onOptionInfo?: (option: BuilderTraitOption) => void;
};

function selectionsInGroup(
  selections: TraitOptionSelection[],
  group: TraitGroup,
): TraitOptionSelection[] {
  return selections.filter(
    (entry) =>
      entry.trait_id === group.trait_id &&
      entry.option_group === group.option_group,
  );
}

export function TraitOptionGroupSection({
  sectionKey,
  title,
  group,
  selections,
  data,
  state,
  onChange,
  buildNextState,
  onOptionInfo,
}: TraitOptionGroupSectionProps) {
  const inGroup = selectionsInGroup(selections, group);

  return (
    <section key={sectionKey}>
      <p className="text-xs font-medium text-foreground">{title}</p>
      {group.notes ? (
        <p className="text-xs text-muted">{group.notes}</p>
      ) : null}
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {visibleTraitOptions(
          group.options,
          group,
          data,
          state,
          selections,
        ).map((opt, index) => {
          const selected = selections.some(
            (entry) => entry.trait_option_id === opt.trait_option_id,
          );
          return (
            <ChipToggle
              key={opt.trait_option_id}
              label={opt.name}
              selected={selected}
              disabled={!selected && inGroup.length >= group.choice_count}
              onInfo={
                opt.description && onOptionInfo
                  ? () => onOptionInfo(opt)
                  : undefined
              }
              onToggle={() =>
                onChange(
                  buildNextState(
                    {
                      trait_id: group.trait_id,
                      option_group: group.option_group,
                      selection_key: selectionKey(group.option_group, index),
                      trait_option_id: opt.trait_option_id,
                    },
                    group.choice_count,
                  ),
                )
              }
            />
          );
        })}
      </div>
    </section>
  );
}
