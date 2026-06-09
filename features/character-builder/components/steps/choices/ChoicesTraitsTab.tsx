import { ChipToggle } from "@/features/character-builder/components/shared/BuilderParts";
import type {
  BuilderBackgroundEntry,
  BuilderSpeciesEntry,
  BuilderTraitOption,
} from "@/features/character-builder/types/builder.types";
import {
  toggleBackgroundTool,
  toggleSpeciesTraitOption,
} from "@/features/character-builder/hooks/useCharacterBuilder";
import { visibleWhenTaken } from "@/features/character-builder/domain/selection";
import type { ChoicesTabProps } from "./types";
import { TraitOptionGroupSection } from "./TraitOptionGroupSection";

type ChoicesTraitsTabProps = ChoicesTabProps & {
  species: BuilderSpeciesEntry;
  background: BuilderBackgroundEntry;
  classToolIds: number[];
  onOptionInfo: (option: BuilderTraitOption) => void;
};

export function ChoicesTraitsTab({
  data,
  state,
  onChange,
  species,
  background,
  classToolIds,
  onOptionInfo,
}: ChoicesTraitsTabProps) {
  const traitGroups = species.traits.flatMap((trait) =>
    trait.choice_groups
      .filter((g) => g.is_required)
      .map((group) => ({ trait, group })),
  );

  return (
    <div className="space-y-4">
      {background.tool_proficiency_options
        .filter((opt) => !opt.tool_id && opt.tool_category)
        .map((opt) => {
          const categoryTools =
            data.tools_by_category[opt.tool_category ?? ""] ?? [];
          const selectedInGroup = state.background_tool_selections
            .filter(
              (entry) =>
                entry.source_type === "background" &&
                entry.source_id === background.id &&
                (entry.option_group ?? opt.option_group) === opt.option_group,
            )
            .map((entry) => entry.tool_id)
            .filter((id): id is number => id !== null);
          return (
            <section key={opt.id}>
              <p className="text-xs font-medium text-foreground">
                Ferramenta do antecedente
              </p>
              <p className="text-xs text-muted">{opt.name}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {visibleWhenTaken(
                  categoryTools.filter(
                    (tool): tool is typeof tool & { tool_id: number } =>
                      tool.tool_id !== null,
                  ),
                  selectedInGroup,
                  classToolIds,
                  (tool) => tool.tool_id,
                ).map((tool) => {
                  const toolId = tool.tool_id;
                  const selected = selectedInGroup.includes(toolId);
                  return (
                    <ChipToggle
                      key={toolId}
                      label={tool.name}
                      selected={selected}
                      onToggle={() =>
                        onChange(
                          toggleBackgroundTool(state, {
                            tool_id: toolId,
                            name: tool.name,
                            source_type: "background",
                            source_id: background.id,
                            option_group: opt.option_group,
                          }, opt.choice_count),
                        )
                      }
                    />
                  );
                })}
              </div>
            </section>
          );
        })}

      {traitGroups.map(({ trait, group }) => (
        <TraitOptionGroupSection
          key={`${trait.trait_id}-${group.option_group}`}
          sectionKey={`${trait.trait_id}-${group.option_group}`}
          title={trait.name}
          traitDescription={trait.description}
          group={group}
          selections={state.species_trait_options}
          data={data}
          state={state}
          onChange={onChange}
          onOptionInfo={onOptionInfo}
          buildNextState={(selection, max) =>
            toggleSpeciesTraitOption(state, selection, max)
          }
        />
      ))}
    </div>
  );
}
