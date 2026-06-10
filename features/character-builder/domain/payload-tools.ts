import { ApiError } from "@/lib/api/errors";
import type {
  CharacterBuilderData,
  CharacterBuilderState,
} from "@/features/character-builder/types/builder.types";

function toolSelectionsForGroup(
  selections: { source_type: string; source_id: number; option_group?: string }[],
  params: { source_type: string; source_id: number; option_group: string },
) {
  return selections.filter(
    (entry) =>
      entry.source_type === params.source_type &&
      entry.source_id === params.source_id &&
      (entry.option_group ?? params.option_group) === params.option_group,
  );
}

export function buildToolProficiencies(
  cls: CharacterBuilderData["classes"][number],
  background: CharacterBuilderData["backgrounds"][number],
  state: CharacterBuilderState,
) {
  for (const group of cls.tool_choices) {
    const selected = toolSelectionsForGroup(state.class_tool_selections, {
      source_type: "class",
      source_id: cls.id,
      option_group: group.option_group,
    });
    if (selected.length !== group.choice_count) {
      throw new ApiError(
        `Selecione ${group.choice_count} ferramenta(s) de classe: ${group.option_group}.`,
        400,
      );
    }
  }

  const requiredBackgroundToolChoices = background.tool_proficiency_options.filter(
    (opt) => !opt.tool_id && opt.tool_category,
  );
  for (const opt of requiredBackgroundToolChoices) {
    const selected = toolSelectionsForGroup(state.background_tool_selections, {
      source_type: "background",
      source_id: background.id,
      option_group: opt.option_group,
    });
    if (selected.length !== opt.choice_count) {
      throw new ApiError(
        `Selecione a ferramenta do antecedente: ${opt.name}.`,
        400,
      );
    }
  }

  const backgroundTools = [...state.background_tool_selections];
  for (const opt of background.tool_proficiency_options) {
    if (opt.tool_id) {
      backgroundTools.push({
        tool_id: opt.tool_id,
        name: opt.name,
        source_type: "background",
        source_id: background.id,
        option_group: opt.option_group,
      });
    }
  }

  return [
    ...state.class_tool_selections,
    ...backgroundTools,
  ];
}
