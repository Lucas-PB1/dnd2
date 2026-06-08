import { ChipToggle } from "@/features/character-builder/components/shared/BuilderParts";
import type {
  BuilderTraitOption,
  CharacterBuilderData,
  CharacterBuilderState,
  TraitOptionSelection,
} from "@/features/character-builder/types/builder.types";
import { visibleTraitOptions } from "@/features/character-builder/domain/selection";
import { selectionKey } from "@/features/character-builder/domain/utils";

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
  traitDescription?: string | null;
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

function traitSectionTitle(traitName: string, optionGroup: string): string {
  const normalized = optionGroup.trim().toLowerCase();
  const generic = new Set([
    "ancestry",
    "choice",
    "options",
    "option",
    "type",
    "variant",
  ]);

  if (
    generic.has(normalized) ||
    normalized === traitName.trim().toLowerCase()
  ) {
    return traitName;
  }

  return `${traitName} — ${optionGroup}`;
}

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
  traitDescription,
  group,
  selections,
  data,
  state,
  onChange,
  buildNextState,
  onOptionInfo,
}: TraitOptionGroupSectionProps) {
  const inGroup = selectionsInGroup(selections, group);

  const displayTitle = title.includes(":")
    ? title
    : traitSectionTitle(title, group.option_group);

  return (
    <section key={sectionKey}>
      <p className="text-xs font-medium text-foreground">{displayTitle}</p>
      {traitDescription ? (
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {traitDescription}
        </p>
      ) : null}
      {group.notes ? (
        <p className="mt-1 text-xs text-muted-subtle">{group.notes}</p>
      ) : null}
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
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
              description={opt.description}
              selected={selected}
              disabled={!selected && inGroup.length >= group.choice_count}
              size="sm"
              onInfo={onOptionInfo ? () => onOptionInfo(opt) : undefined}
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
